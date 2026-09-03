import { newCallPage } from "../pages/NewCallPage";

function parseNumbers(): string[] {
  const raw = Cypress.env("MV_CALL_NUMBERS");
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : typeof raw === "string" && raw.trim()
      ? raw.split(/[,\n]/)
      : [];

  const cleaned = list.map((s) => String(s).trim()).filter(Boolean);
  if (cleaned.length) return cleaned;

  const fallback = String(Cypress.env("MV_TEST_PHONE") || "").trim();
  return fallback ? [fallback] : [];
}

const callNumbers = parseNumbers();

describe("MagickVoice Live Outbound Call Dispatch", { retries: 0 }, () => {
  if (callNumbers.length === 0) {
    it("skipped — no MV_CALL_NUMBERS or MV_TEST_PHONE configured", function () {
      cy.log("No target numbers configured; nothing to dispatch.");
      this.skip();
    });
    return;
  }

  callNumbers.forEach((phoneNumber, index) => {
    it(`dispatches call ${index + 1}/${callNumbers.length} to ${phoneNumber}`, () => {
      newCallPage.dispatchOutboundCall(phoneNumber);
      cy.wait(2000);
    });
  });
});
