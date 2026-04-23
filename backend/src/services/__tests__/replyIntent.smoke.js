/* eslint-disable no-console */
/**
 * Smoke tests for replyIntentClassifier.
 *
 * Runs without a database or network. Covers:
 *   - Heuristic fallback correctly categorizes canonical replies
 *   - AI path uses a stubbed OpenAI client and returns parsed JSON
 *   - AI failures fall back to heuristic
 *   - Bad JSON responses fall back to heuristic
 *   - Draft sanitation + truncation
 */

const assert = require("assert");

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-test-stub-do-not-use";

const {
  classifyReply,
  classifyHeuristic,
  INTENTS,
  _internal,
} = require("../replyIntentClassifier");
const { _setOpenAIClientForTesting, _resetForTesting } = require("../../config/openai");

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  return (async () => {
    try {
      await fn();
      passed++;
      results.push(`  ✓ ${name}`);
    } catch (err) {
      failed++;
      results.push(`  ✗ ${name}\n      ${err.stack || err.message}`);
    }
  })();
}

function makeStubClient({ content, shouldThrow = false } = {}) {
  return {
    chat: {
      completions: {
        create: async () => {
          if (shouldThrow) throw new Error("simulated network error");
          return { choices: [{ message: { content } }] };
        },
      },
    },
  };
}

async function run() {
  console.log("\n=== Reply Intent Classifier Smoke Tests ===\n");

  // -------- Heuristic tests --------
  await test("heuristic: 'thinking about selling' → hot", () => {
    const r = classifyHeuristic("I've actually been thinking about selling our place next year.");
    assert.strictEqual(r.intent, "hot");
  });

  await test("heuristic: 'my friend wants to buy' → hot (referral)", () => {
    const r = classifyHeuristic("My friend who just moved here is looking to buy, can I connect you?");
    assert.strictEqual(r.intent, "hot");
  });

  await test("heuristic: 'what's my home worth?' → hot", () => {
    const r = classifyHeuristic("What's my house worth these days?");
    assert.strictEqual(r.intent, "hot");
  });

  await test("heuristic: question without transaction → question", () => {
    const r = classifyHeuristic("How often do you send these?");
    assert.strictEqual(r.intent, "question");
  });

  await test("heuristic: 'not interested' → negative", () => {
    const r = classifyHeuristic("Not interested, please stop texting me.");
    assert.strictEqual(r.intent, "negative");
  });

  await test("heuristic: 'busy, maybe later' → cold", () => {
    const r = classifyHeuristic("Really busy right now, maybe later.");
    assert.strictEqual(r.intent, "cold");
  });

  await test("heuristic: 'thanks!' → warm", () => {
    const r = classifyHeuristic("Thanks so much for checking in!");
    assert.strictEqual(r.intent, "warm");
  });

  await test("heuristic: generic reply → unknown", () => {
    const r = classifyHeuristic("ok");
    assert.strictEqual(r.intent, "unknown");
  });

  await test("heuristic: empty reply → unknown", () => {
    const r = classifyHeuristic("");
    assert.strictEqual(r.intent, "unknown");
    assert.strictEqual(r.confidence, 0);
  });

  // -------- AI path tests --------
  await test("ai: parses well-formed JSON and sanitizes draft", async () => {
    _resetForTesting();
    _setOpenAIClientForTesting(
      makeStubClient({
        content: JSON.stringify({
          intent: "hot",
          confidence: 0.88,
          reason: "Mentioned selling next year",
          draft_reply: '"Awesome — happy to run you a no-pressure value estimate this week. Want me to send it over?"',
        }),
      })
    );
    const r = await classifyReply({
      replyText: "I've been thinking about selling next year.",
      client: { first_name: "Sarah", city: "Austin", state: "TX" },
      agent: { first_name: "Logan", last_name: "Doeden" },
    });
    assert.strictEqual(r.intent, "hot");
    assert.strictEqual(r.ai_used, true);
    assert.strictEqual(r.confidence, 0.88);
    // Surrounding quotes are stripped.
    assert.ok(r.draft_reply && !r.draft_reply.startsWith('"'), "draft quotes should be stripped");
    assert.ok(r.draft_reply.length <= 280, "draft should respect length cap");
    _resetForTesting();
  });

  await test("ai: cold intent produces null draft (agent shouldn't auto-reply)", async () => {
    _resetForTesting();
    _setOpenAIClientForTesting(
      makeStubClient({
        content: JSON.stringify({
          intent: "cold",
          confidence: 0.8,
          reason: "Deflection",
          draft_reply: "Totally understand, have a great week.",
        }),
      })
    );
    const r = await classifyReply({ replyText: "not right now, swamped" });
    assert.strictEqual(r.intent, "cold");
    assert.strictEqual(r.draft_reply, null, "cold replies should not auto-draft");
    _resetForTesting();
  });

  await test("ai: unparseable response falls back to heuristic", async () => {
    _resetForTesting();
    _setOpenAIClientForTesting(makeStubClient({ content: "not json at all" }));
    const r = await classifyReply({ replyText: "What's my home worth?" });
    assert.strictEqual(r.ai_used, false);
    assert.strictEqual(r.intent, "hot");
    assert.ok(r.fallback_reason && /unparseable/i.test(r.fallback_reason));
    _resetForTesting();
  });

  await test("ai: thrown error falls back to heuristic without throwing", async () => {
    _resetForTesting();
    _setOpenAIClientForTesting(makeStubClient({ shouldThrow: true }));
    const r = await classifyReply({ replyText: "Thanks so much!" });
    assert.strictEqual(r.ai_used, false);
    assert.strictEqual(r.intent, "warm");
    assert.ok(r.fallback_reason && /AI error/i.test(r.fallback_reason));
    _resetForTesting();
  });

  await test("ai: unknown intent string coerces to heuristic baseline", () => {
    const raw = _internal.coerceIntent("hallucinated_intent");
    assert.strictEqual(raw, null);
    for (const i of INTENTS) {
      assert.strictEqual(_internal.coerceIntent(i), i);
    }
  });

  await test("ai: confidence clamped to [0, 1]", () => {
    assert.strictEqual(_internal.coerceConfidence(-0.5), 0);
    assert.strictEqual(_internal.coerceConfidence(1.8), 1);
    assert.strictEqual(_internal.coerceConfidence("nope"), null);
  });

  await test("ai: sanitizeDraft truncates very long drafts cleanly", () => {
    const long = "hey ".repeat(200);
    const cleaned = _internal.sanitizeDraft(long);
    assert.ok(cleaned.length <= 280);
    assert.ok(cleaned.endsWith("…") || cleaned.length < 280);
  });

  await test("ai: parseModelJson handles code-fenced JSON", () => {
    const parsed = _internal.parseModelJson('```json\n{"intent":"warm","confidence":0.6,"reason":"x","draft_reply":null}\n```');
    assert.deepStrictEqual(parsed, { intent: "warm", confidence: 0.6, reason: "x", draft_reply: null });
  });

  console.log(results.join("\n"));
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
