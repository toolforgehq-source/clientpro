const crypto = require("crypto");

/**
 * Deterministic stub for per-client market context used by the AI message
 * generator. Given the same (zip, state, property_type, closing_date) it
 * always returns the same values — this matters because the same client
 * should get a consistent story across messages ("up 4.2% this quarter"
 * shouldn't flip to "down 1.8%" between two messages sent days apart).
 *
 * The output shape is deliberately small and neutral so a real data
 * provider (MLS, RapidAPI Zillow, RentCast, Redfin, etc.) can drop in by
 * replacing only this file.
 *
 * TODO: swap in a real market-data provider (PR 4+). Candidate sources:
 *   - RentCast (has a Zestimate-like API)
 *   - RapidAPI Zillow (unofficial)
 *   - ATTOM Data Solutions (licensed, priciest but most accurate)
 */

const PROPERTY_TYPE_LABELS = {
  single_family: "house",
  condo: "condo",
  townhouse: "townhouse",
  multi_family: "property",
  land: "property",
  other: "place",
};

const hashToFloat = (seedString) => {
  const hash = crypto.createHash("sha256").update(seedString).digest();
  // Use first 4 bytes as a uint32, normalize to [0, 1)
  const n = hash.readUInt32BE(0);
  return n / 0xffffffff;
};

const yearsSinceClosing = (closingDate, now = new Date()) => {
  if (!closingDate) return 0;
  const closed = closingDate instanceof Date ? closingDate : new Date(closingDate);
  if (Number.isNaN(closed.getTime())) return 0;
  const diffMs = now.getTime() - closed.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
};

/**
 * Return a stable mock market snapshot for a client.
 *
 * @param {object} client    Must have city, state, zip, property_type, closing_date.
 * @param {Date}   [asOf]    Injectable clock for tests.
 * @returns {{
 *   source: "mock",
 *   city: string,
 *   state: string,
 *   zip: string|null,
 *   property_type_label: string,
 *   years_since_closing: number,
 *   quarter_change_pct: number,
 *   direction: "up"|"down"|"flat",
 *   median_days_on_market: number,
 *   typical_equity_gain_pct: number
 * }}
 */
const getMarketContext = (client, asOf = new Date()) => {
  const zip = client.zip || "";
  const state = client.state || "";
  const city = client.city || "";
  const propertyType = client.property_type || "other";
  const label = PROPERTY_TYPE_LABELS[propertyType] || "place";

  const years = yearsSinceClosing(client.closing_date, asOf);

  // Deterministic per-location values so repeated calls are stable.
  const seedBase = `${zip}|${state}|${city}`.toLowerCase();
  const r1 = hashToFloat(`${seedBase}|qoq`);
  const r2 = hashToFloat(`${seedBase}|dom`);

  // Quarter change: most markets sit between -3% and +6% QoQ, with a slight
  // positive bias. This is a stand-in — real data replaces this entirely.
  const quarterChangePct = Math.round((r1 * 9 - 3) * 10) / 10;
  let direction = "flat";
  if (quarterChangePct > 0.3) direction = "up";
  else if (quarterChangePct < -0.3) direction = "down";

  const medianDaysOnMarket = Math.round(25 + r2 * 30);

  // Typical equity gain ~3.5% annually, slightly compounded. Again, a
  // placeholder until we wire a real provider.
  const typicalEquityGainPct = Math.round(years * 3.5 * 10) / 10;

  return {
    source: "mock",
    city,
    state,
    zip: zip || null,
    property_type_label: label,
    years_since_closing: years,
    quarter_change_pct: quarterChangePct,
    direction,
    median_days_on_market: medianDaysOnMarket,
    typical_equity_gain_pct: typicalEquityGainPct,
  };
};

module.exports = {
  getMarketContext,
  yearsSinceClosing,
  PROPERTY_TYPE_LABELS,
};
