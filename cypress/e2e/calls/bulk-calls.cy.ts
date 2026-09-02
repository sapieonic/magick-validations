import { callsPage } from "../../pages/CallsPage";

describe("MagickVoice Bulk / Batch Calls — Comprehensive UI & Scenario Validations", () => {
  const testPhone = Cypress.env("MV_TEST_PHONE");

  beforeEach(() => {
    callsPage.visit();
  });

  describe("Suite 1: Bulk Calls Modal Layout, Sub-Components & Form Structure", () => {
    it("1.1 clicks 'Bulk Calls' button and verifies modal dialog opens and becomes visible", () => {
      callsPage.openBulkCallsModal();
      callsPage.getBulkCallsModal().should("be.visible");
      callsPage.closeBulkCallsModal();
    });

    it("1.2 validates Bulk Calls modal header, title, and close dismiss control", () => {
      callsPage.openBulkCallsModal();
      callsPage.getBulkCallsModalTitle().should("be.visible");
      callsPage.getBulkCallsModalCloseButton().should("be.visible");
      callsPage.closeBulkCallsModal();
    });

    it("1.3 validates CSV / Contacts upload area and sample template download link", () => {
      callsPage.openBulkCallsModal();
      callsPage.getBulkCallsCsvUploadArea().should("exist");
      callsPage.getBulkCallsSampleCsvLink().should("exist");
      callsPage.closeBulkCallsModal();
    });

    it("1.4 validates Prompt Template, Outbound Caller ID, and AI Pipeline Tier selectors inside modal", () => {
      callsPage.openBulkCallsModal();
      callsPage.getBulkCallsPromptSelector().should("exist");
      callsPage.getBulkCallsCallerIdSelector().should("exist");
      callsPage.getBulkCallsPipelineSelector().should("exist");
      callsPage.closeBulkCallsModal();
    });
  });

  describe("Suite 2: Batch Calling Scenarios & Submission Validations", () => {
    it("2.1 verifies input validation and submission block when attempting to submit empty batch form", () => {
      callsPage.openBulkCallsModal();
      callsPage.verifyBulkCallsEmptyValidation();
      callsPage.closeBulkCallsModal();
    });

    it("2.2 fills batch form with target phone, configures prompt & pipeline, and validates successful dispatch API response", () => {
      callsPage.openBulkCallsModal();
      callsPage.verifyBulkCallsSuccessDispatch(testPhone);
      callsPage.closeBulkCallsModal();
    });

    it("2.3 handles batch dispatch API failure (e.g. 402 Insufficient Credits) and validates UI error response", () => {
      callsPage.openBulkCallsModal();
      callsPage.verifyBulkCallsErrorHandling(testPhone);
      callsPage.closeBulkCallsModal();
    });

    it("2.4 verifies Cancel / Discard action closes modal cleanly and preserves Calls dashboard state", () => {
      callsPage.openBulkCallsModal();
      callsPage.closeBulkCallsModal();
      cy.url({ timeout: 15000 }).should("include", "/app/calls");
      callsPage.verifyCallsHeader();
    });
  });
});
