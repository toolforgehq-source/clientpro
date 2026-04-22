/**
 * Smoke tests for the Follow Up Boss integration helpers.
 *
 * These run without any network, secrets, or database. We stub global fetch
 * to drive the FUB client through its happy path, rate-limit path, and
 * pagination path; and we run the mapper against representative FUB person
 * payloads to make sure the import pipeline won't silently drop or corrupt
 * real-world contacts.
 *
 * Exit code is non-zero on any failure so CI / npm scripts can wire this in.
 */
/* eslint-disable no-console */

const assert = require("node:assert/strict");

process.env.FUB_KEY_ENCRYPTION_SECRET = "smoke-test-secret";
process.env.JWT_SECRET = "smoke-test-jwt";

const { encrypt, decrypt } = require("../../config/fubCrypto");
const fubClient = require("../followUpBossClient");
const { mapPersonToClient, normalizePhone } = require("../fubMapper");

let passed = 0;
let failed = 0;

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log(`  ok - ${name}`);
    })
    .catch((err) => {
      failed++;
      console.error(`  FAIL - ${name}:`, err?.message || err);
    });
}

function makeFakeFetch(handler) {
  return async (url, init) => {
    const response = await handler(String(url), init || {});
    const status = response.status ?? 200;
    const body = response.body === undefined ? "" : JSON.stringify(response.body);
    const headers = new Map(Object.entries(response.headers || {}));
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (k) => headers.get(k.toLowerCase()) ?? null },
      text: async () => body,
    };
  };
}

(async () => {
  console.log("FUB crypto");
  await test("encrypt/decrypt roundtrip", () => {
    const plain = "fka_live_example_0123456789";
    const enc = encrypt(plain);
    assert.ok(enc && enc.startsWith("v1:"));
    assert.equal(decrypt(enc), plain);
  });
  await test("decrypt returns null on tampered payload", () => {
    const enc = encrypt("hello");
    const tampered = enc.slice(0, -4) + "AAAA";
    assert.equal(decrypt(tampered), null);
  });
  await test("encrypt handles empty input", () => {
    assert.equal(encrypt(""), null);
    assert.equal(encrypt(null), null);
  });

  console.log("FUB mapper");
  await test("normalizePhone formats US 10-digit", () => {
    assert.equal(normalizePhone("(415) 555-0100"), "+14155550100");
    assert.equal(normalizePhone("1-415-555-0100"), "+14155550100");
    assert.equal(normalizePhone("555-0100"), null);
    assert.equal(normalizePhone(""), null);
  });
  await test("mapPersonToClient picks mobile phone + primary email", () => {
    const result = mapPersonToClient({
      id: 42,
      firstName: "Sam",
      lastName: "Client",
      createdAt: "2024-06-15T10:00:00Z",
      phones: [
        { value: "415-555-0200", type: "Home" },
        { value: "415-555-0201", type: "Mobile" },
      ],
      emails: [
        { value: "other@example.com", isPrimary: false },
        { value: "primary@example.com", isPrimary: true },
      ],
      addresses: [
        {
          street: "1 Market St",
          city: "San Francisco",
          state: "CA",
          code: "94105",
          isPrimary: true,
        },
      ],
    });
    assert.equal(result.ok, true);
    assert.equal(result.fub_person_id, 42);
    assert.equal(result.client.phone_number, "+14155550201");
    assert.equal(result.client.email, "primary@example.com");
    assert.equal(result.client.property_address, "1 Market St");
    assert.equal(result.client.city, "San Francisco");
    assert.equal(result.client.state, "CA");
    assert.equal(result.client.zip, "94105");
    assert.equal(result.client.closing_date, "2024-06-15");
  });
  await test("mapPersonToClient defaults closing date override works", () => {
    const result = mapPersonToClient(
      {
        id: 7,
        firstName: "A",
        lastName: "B",
        phones: [{ value: "4155550100", type: "Mobile" }],
      },
      { defaultClosingDate: "2023-01-15T00:00:00Z" }
    );
    assert.equal(result.ok, true);
    assert.equal(result.client.closing_date, "2023-01-15");
  });
  await test("mapPersonToClient rejects non-US / short phones", () => {
    const result = mapPersonToClient({
      id: 1,
      firstName: "A",
      lastName: "B",
      phones: [{ value: "+44 20 7946 0000", type: "Mobile" }],
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /phone/i);
  });
  await test("mapPersonToClient rejects missing names", () => {
    const noFirst = mapPersonToClient({ id: 1, lastName: "B", phones: [{ value: "4155550100" }] });
    assert.equal(noFirst.ok, false);
    const noLast = mapPersonToClient({ id: 1, firstName: "A", phones: [{ value: "4155550100" }] });
    assert.equal(noLast.ok, false);
  });
  await test("mapPersonToClient drops invalid US state", () => {
    const result = mapPersonToClient({
      id: 2,
      firstName: "A",
      lastName: "B",
      phones: [{ value: "4155550100", type: "Mobile" }],
      addresses: [{ street: "1 Market St", city: "SF", state: "California", code: "94105" }],
    });
    assert.equal(result.ok, true);
    assert.equal(result.client.state, null);
  });

  console.log("FUB client (stubbed fetch)");
  const realFetch = global.fetch;

  await test("getIdentity sends Basic auth + parses identity", async () => {
    let captured;
    global.fetch = makeFakeFetch(async (url, init) => {
      captured = { url, init };
      return { status: 200, body: { id: 77, name: "Acme Realty" } };
    });
    try {
      const identity = await fubClient.getIdentity("sekret-key");
      assert.equal(identity.id, 77);
      assert.equal(identity.name, "Acme Realty");
      assert.match(captured.url, /\/v1\/identity$/);
      const expectedAuth = "Basic " + Buffer.from("sekret-key:", "utf8").toString("base64");
      assert.equal(captured.init.headers.Authorization, expectedAuth);
    } finally {
      global.fetch = realFetch;
    }
  });

  await test("getIdentity maps 401 to FUB_UNAUTHORIZED", async () => {
    global.fetch = makeFakeFetch(async () => ({
      status: 401,
      body: { errorMessage: "Invalid key" },
    }));
    try {
      await fubClient.getIdentity("bad-key");
      throw new Error("expected throw");
    } catch (err) {
      assert.equal(err.code, "FUB_UNAUTHORIZED");
    } finally {
      global.fetch = realFetch;
    }
  });

  await test("getIdentity maps 429 with retry-after", async () => {
    global.fetch = makeFakeFetch(async () => ({
      status: 429,
      headers: { "retry-after": "7" },
      body: { errorMessage: "slow down" },
    }));
    try {
      await fubClient.getIdentity("k");
      throw new Error("expected throw");
    } catch (err) {
      assert.equal(err.code, "FUB_RATE_LIMITED");
      assert.equal(err.retryAfterSeconds, 7);
    } finally {
      global.fetch = realFetch;
    }
  });

  await test("iteratePeople paginates until empty", async () => {
    const pages = [
      {
        people: [
          { id: 1, firstName: "A", lastName: "A", phones: [{ value: "4155550001", type: "Mobile" }] },
          { id: 2, firstName: "B", lastName: "B", phones: [{ value: "4155550002", type: "Mobile" }] },
        ],
        _metadata: { total: 3 },
      },
      {
        people: [
          { id: 3, firstName: "C", lastName: "C", phones: [{ value: "4155550003", type: "Mobile" }] },
        ],
        _metadata: { total: 3 },
      },
      { people: [], _metadata: { total: 3 } },
    ];
    let callIdx = 0;
    const calls = [];
    global.fetch = makeFakeFetch(async (url) => {
      calls.push(url);
      const resp = pages[callIdx++] || { people: [] };
      return { status: 200, body: resp };
    });
    try {
      const batches = [];
      const summary = await fubClient.iteratePeople("k", {
        maxPeople: 10,
        pageSize: 2,
        onBatch: ({ people }) => batches.push(people.length),
      });
      assert.deepEqual(batches, [2, 1]);
      assert.equal(summary.fetched, 3);
      assert.equal(summary.total, 3);
      assert.ok(calls[0].includes("offset=0"));
      assert.ok(calls[0].includes("limit=2"));
      assert.ok(calls[1].includes("offset=2"));
    } finally {
      global.fetch = realFetch;
    }
  });

  await test("iteratePeople stops at maxPeople", async () => {
    global.fetch = makeFakeFetch(async () => ({
      status: 200,
      body: {
        people: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          firstName: "A",
          lastName: "B",
          phones: [{ value: `41555501${String(i).padStart(2, "0")}`, type: "Mobile" }],
        })),
        _metadata: { total: 1000 },
      },
    }));
    try {
      const summary = await fubClient.iteratePeople("k", {
        maxPeople: 150,
        pageSize: 100,
        onBatch: () => {},
      });
      assert.equal(summary.fetched, 150);
    } finally {
      global.fetch = realFetch;
    }
  });

  console.log("");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) process.exit(1);
})();
