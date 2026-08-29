import { newCallPage } from "../../pages/NewCallPage";

describe("MagickVoice Live Outbound Call Dispatch (4 Numbers Verification)", () => {
  const envNumbers = Cypress.env("MV_CALL_NUMBERS");
  const callNumbers: string[] = Array.isArray(envNumbers)
    ? envNumbers
    : typeof envNumbers === "string" && envNumbers.trim()
    ? envNumbers.split(",").map((s) => s.trim())
    : [
        Cypress.env("MV_TEST_PHONE") || "+916371813048",
        "+916371813048",
        "+916371813048",
        "+916371813048",
      ];

  it(`dispatches outbound calls sequentially to all ${callNumbers.length} numbers`, () => {
    callNumbers.forEach((phoneNumber, index) => {
      cy.log(`--- Dispatching Call ${index + 1} of ${callNumbers.length} to: ${phoneNumber} ---`);
      newCallPage.dispatchOutboundCall(phoneNumber);
      cy.wait(2000);
    });
  });
});
