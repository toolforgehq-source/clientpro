/**
 * Maps a Follow Up Boss person object into the shape Client.create accepts.
 *
 * A mapped person is considered importable only when it has enough to be a
 * real past-client record in ClientPro: a first name, a last name, and a
 * phone we can normalize to +1XXXXXXXXXX. Anything else is optional. When a
 * required field is missing we return { ok: false, reason } so the caller
 * can surface a per-row error to the agent.
 *
 * closing_date handling: ClientPro's clients.closing_date is NOT NULL, but
 * FUB people don't carry a closing date field. We use the person's FUB
 * `createdAt` timestamp as a reasonable proxy (the agent added them to FUB
 * at or near their closing). Callers can override with a
 * `defaultClosingDate` for bulk imports where all contacts share a known
 * closing date.
 */
const US_STATE_ABBREVIATIONS = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
]);

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  // Non-US numbers: ClientPro is US-only today, so we skip rather than
  // silently fabricate a +1 prefix.
  return null;
}

function pickBestPhone(person) {
  const phones = Array.isArray(person?.phones) ? person.phones : [];
  // Prefer mobile over other types, then status === primary, then first.
  const mobile = phones.find((p) => /mobile/i.test(p?.type || ""));
  const primary = phones.find((p) => p?.isPrimary === true || /primary/i.test(p?.status || ""));
  const any = phones[0];
  const chosen = mobile || primary || any;
  return chosen ? normalizePhone(chosen.value || chosen.phone || chosen.number) : null;
}

function pickBestEmail(person) {
  const emails = Array.isArray(person?.emails) ? person.emails : [];
  const primary = emails.find((e) => e?.isPrimary === true);
  const chosen = primary || emails[0];
  const value = chosen?.value || chosen?.email || null;
  return value ? String(value).trim() : null;
}

function pickBestAddress(person) {
  const addresses = Array.isArray(person?.addresses) ? person.addresses : [];
  const primary = addresses.find((a) => a?.isPrimary === true);
  const chosen = primary || addresses[0];
  if (!chosen) return { street: null, city: null, state: null, zip: null };
  const street = chosen.street || chosen.line1 || chosen.streetAddress || null;
  const city = chosen.city || null;
  const rawState = chosen.state || chosen.region || null;
  const zip = chosen.code || chosen.zip || chosen.zipCode || chosen.postalCode || null;
  let state = rawState ? String(rawState).trim().toUpperCase() : null;
  if (state && state.length !== 2) {
    // FUB may store full state names; we require 2-letter abbreviations.
    state = null;
  } else if (state && !US_STATE_ABBREVIATIONS.has(state)) {
    state = null;
  }
  return {
    street: street ? String(street).trim() : null,
    city: city ? String(city).trim() : null,
    state,
    zip: zip ? String(zip).trim() : null,
  };
}

function toIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapPersonToClient(person, { defaultClosingDate = null } = {}) {
  if (!person || typeof person !== "object") {
    return { ok: false, reason: "Empty person record" };
  }

  const firstName = (person.firstName || person.first_name || "").trim();
  const lastName = (person.lastName || person.last_name || "").trim();
  if (!firstName) return { ok: false, reason: "Missing first name" };
  if (!lastName) return { ok: false, reason: "Missing last name" };

  const phone_number = pickBestPhone(person);
  if (!phone_number) return { ok: false, reason: "No usable US phone number" };

  const email = pickBestEmail(person);
  const addr = pickBestAddress(person);

  const fubId = person.id == null ? null : Number(person.id);
  if (fubId == null || Number.isNaN(fubId)) {
    return { ok: false, reason: "Missing FUB person id" };
  }

  const closing_date =
    toIsoDate(defaultClosingDate) ||
    toIsoDate(person.createdAt || person.created_at) ||
    new Date().toISOString().slice(0, 10);

  return {
    ok: true,
    fub_person_id: fubId,
    client: {
      first_name: firstName,
      last_name: lastName,
      phone_number,
      email,
      property_address: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      property_type: null,
      closing_date,
      notes: null,
    },
  };
}

module.exports = { mapPersonToClient, normalizePhone };
