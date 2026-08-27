import { callsPage } from "../../pages/CallsPage";

describe("MagickVoice Calls Page — Top Header & Page Guide Validations", () => {
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
    });

    it("renders primary action buttons: 'Bulk Calls' and '+ New Call'", () => {
      callsPage.getBulkCallsButton()
        .should("be.visible")
        .and("not.be.disabled");

      callsPage.getNewCallButton()
        .should("be.visible")
        .and("not.be.disabled");
    });
  });

  describe("2. PAGE GUIDE Information Card", () => {
    it("renders 'PAGE GUIDE' header label and information card container", () => {
      callsPage.getPageGuideHeader().should("be.visible");
      callsPage.getPageGuideDescription().should("be.visible");
    });

    it("displays instructional bullet points for call tracking and filters", () => {
      callsPage.verifyPageGuideBulletTips();
    });

    it("renders 'Read the full guide' external documentation link", () => {
      callsPage.getPageGuideFullGuideLink()
        .should("be.visible")
        .and("have.attr", "href");
    });
  });
});
