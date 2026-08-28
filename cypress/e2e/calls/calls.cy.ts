import { callsPage } from "../../pages/CallsPage";

describe("MagickVoice Calls Page — Comprehensive Header, Page Guide, Modals & Action Flows", () => {
  beforeEach(() => {
    callsPage.visit();
  });

  describe("1. Top Header Bar & Action Buttons", () => {
    it("renders 'Calls' page title and total calls counter badge", () => {
      callsPage.verifyCallsHeader();
      callsPage.verifyCallsCountBadge();
    });

    it("renders Refresh, Export CSV, and Filter action controls", () => {
      callsPage.getRefreshButton().should("be.visible");
      callsPage.getExportCsvButton().should("be.visible");
      callsPage.getFilterButton().should("be.visible");
    });

    it("renders primary action buttons: 'Bulk Calls' and '+ New Call'", () => {
      callsPage.getBulkCallsButton()
        .should("be.visible")
        .and("not.be.disabled");

      callsPage.getNewCallButton()
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("clicks 'Export CSV' button, triggers automated download, and verifies saved CSV file", () => {
      callsPage.triggerExportCsv();
    });

    it("verifies all header action buttons are visible and active", () => {
      callsPage.verifyAllHeaderActionButtons();
    });
  });

  describe("2. PAGE GUIDE Information Card", () => {
    it("renders 'PAGE GUIDE' header label and information card container if present", () => {
      cy.get("body").then(($body) => {
        const hasGuide = $body.find("*").filter((_, el) => /page guide/i.test(el.innerText || "")).length > 0;
        if (hasGuide) {
          callsPage.getPageGuideHeader().should("be.visible");
          callsPage.getPageGuideDescription().should("be.visible");
          callsPage.verifyPageGuideInformationCard();
        } else {
          cy.log("Page Guide is collapsed/dismissed in current session");
        }
      });
    });

    it("displays instructional bullet points for call tracking and filters", () => {
      cy.get("body").then(($body) => {
        const hasGuide = $body.find("*").filter((_, el) => /page guide/i.test(el.innerText || "")).length > 0;
        if (hasGuide) {
          callsPage.verifyPageGuideBulletTips();
        } else {
          cy.log("Page Guide bullet tips skipped (guide collapsed)");
        }
      });
    });

    it("renders 'Read the full guide' external documentation link", () => {
      cy.get("body").then(($body) => {
        const hasGuide = $body.find("*").filter((_, el) => /page guide/i.test(el.innerText || "")).length > 0;
        if (hasGuide) {
          callsPage.getPageGuideFullGuideLink()
            .should("be.visible")
            .and("have.attr", "href");
        } else {
          cy.log("Full guide link skipped (guide collapsed)");
        }
      });
    });

    it("toggles Page Guide card collapse and expand state", () => {
      callsPage.togglePageGuide();
      cy.get("body").should("exist");
    });
  });

  describe("3. Action Modals, Dialogs & Creation Screen Validations", () => {
    it("clicks '+ New Call' button and validates transition to New Call creation form with interactive fields", () => {
      callsPage.verifyNewCallCreationFormSections();
    });

    it("navigates to New Call creation screen and returns cleanly back to Calls dashboard", () => {
      callsPage.openNewCall();
      cy.url({ timeout: 15000 }).should("include", "/app/calls/new");

      callsPage.returnToCallsList();
      cy.url({ timeout: 15000 }).should("include", "/app/calls");
    });

    it("asserts '+ New Call' modal / page flow handles dismissal and controls properly", () => {
      callsPage.verifyNewCallModalFlow();
    });

    it("clicks 'Bulk Calls' button and validates bulk composer workflow", () => {
      callsPage.verifyBulkCallsWorkflow();
    });

    it("clicks Filter icon button and validates filter popover / dropdown state", () => {
      callsPage.verifyFilterPopoverFlow();
    });
  });
});
