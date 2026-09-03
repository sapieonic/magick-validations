import { callDetailPage } from "../../pages/CallDetailPage";

describe("MagickVoice Call Details Page — Comprehensive Section & Component Validations", () => {
  describe("Suite 1: Failed / Cancelled Call Record — Component & Section Validations", () => {
    beforeEach(() => {
      callDetailPage.navigateToCallByStatus("failed");
    });

    it("1.1 navigates to a Failed call record and validates active route /app/calls/:callId", () => {
      cy.log("Asserting active URL route contains call UUID...");
      cy.url({ timeout: 15000 }).should("match", /\/app\/calls\/[0-9a-zA-Z-]+/);
    });

    it("1.2 validates Header controls: Back button, Call UUID badge, 'Failed' status badge, and Direction tag", () => {
      callDetailPage.verifyHeaderSection("failed");
    });

    it("1.3 validates Top Follow-up and Call Metadata: Recipient Phone, Duration (0s), Pipeline, Provider, and Timestamps", () => {
      callDetailPage.verifyFollowUpSection();
      callDetailPage.verifyMetadataSection();
    });

    it("1.4 validates Failure Reason / Disconnection Details and Prompt Configuration card", () => {
      cy.log("Verifying Failure error reason / alert details...");
      callDetailPage.getFailureReasonOrError().should("exist");
      callDetailPage.verifyPromptConfigSection();
    });

    it("1.5 validates Back navigation button returns cleanly to Calls table", () => {
      callDetailPage.clickBack();
      cy.url({ timeout: 15000 }).should("match", /\/app\/calls(?:\?.*)?$/);
    });
  });

  describe("Suite 2: Completed / Successful Call Record — Component & Section Validations", () => {
    beforeEach(() => {
      callDetailPage.navigateToCallByStatus("completed");
    });

    it("2.1 navigates to a Completed call record and validates active route /app/calls/:callId", () => {
      cy.log("Asserting active URL route contains call UUID...");
      cy.url({ timeout: 15000 }).should("match", /\/app\/calls\/[0-9a-zA-Z-]+/);
    });

    it("2.2 validates Header controls: Back button, Call UUID badge, 'Completed' status badge, and Direction tag", () => {
      callDetailPage.verifyHeaderSection("completed");
    });

    it("2.3 validates Top Follow-up & Recommendations banner at top of the page", () => {
      callDetailPage.verifyFollowUpSection();
    });

    it("2.4 validates Call Metadata: Recipient Phone Number, Duration, AI Pipeline Tier, Voice Provider, and Timestamps", () => {
      callDetailPage.verifyMetadataSection();
    });

    it("2.5 validates Audio Player & interactive playback controls (play/pause toggle & waveform)", () => {
      callDetailPage.verifyAudioRecordingSection();
      callDetailPage.playAndPauseAudio();
    });

    it("2.6 validates Audio Recording download control and recording URL access", () => {
      callDetailPage.verifyAudioDownload();
    });

    it("2.7 validates Conversation Transcript timeline (AI Assistant vs User message turns & dialogue bubbles)", () => {
      callDetailPage.verifyTranscriptDetails();
    });

    it("2.8 validates Call Analysis, Sentiment & Evaluation summary section", () => {
      callDetailPage.verifyCallAnalysisSection();
    });

    it("2.9 validates Prompt instructions & Call Parameters metadata card", () => {
      callDetailPage.verifyPromptConfigSection();
    });

    it("2.10 validates Back navigation button returns cleanly to Calls table", () => {
      callDetailPage.clickBack();
      cy.url({ timeout: 15000 }).should("match", /\/app\/calls(?:\?.*)?$/);
    });
  });
  
  describe("Suite 3: Multi-Component Settlement & UI Integrity Check", () => {
    it("3.1 validates all sections and cards are populated and settled cleanly", () => {
      callDetailPage.visit();
      callDetailPage.verifyAllSectionsPresent();
    });
  });
});
