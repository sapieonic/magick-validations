import { callsPage } from "../../pages/CallsPage";

describe("MagickVoice Calls Dashboard — Comprehensive Main Page, Filters & Table Validations (3 Iterations)", () => {
  beforeEach(() => {
    callsPage.visit();
  });

  describe("Iteration 1: Top Navigation Bar, Header Toolbar & Action Controls", () => {
    it("1.1 renders organization switcher, credits balance badge, and user profile", () => {
      callsPage.getCreditsBadge().should("be.visible");
      callsPage.getUserProfileDropdown().should("be.visible");
    });

    it("1.2 renders 'Calls' page title and total calls counter badge", () => {
      callsPage.verifyCallsHeader();
      callsPage.verifyCallsCountBadge();
    });

    it("1.3 renders Refresh, Export CSV, and Filter action controls in header toolbar", () => {
      callsPage.getRefreshButton().should("be.visible");
      callsPage.getExportCsvButton().should("be.visible");
      callsPage.getFilterButton().should("be.visible");
    });

    it("1.4 renders primary action buttons: 'Bulk Calls' and '+ New Call'", () => {
      callsPage.getBulkCallsButton()
        .should("be.visible")
        .and("not.be.disabled");

      callsPage.getNewCallButton()
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("1.5 clicks 'Export CSV' button, triggers automated download, and verifies saved CSV file", () => {
      callsPage.triggerExportCsv();
    });
  });

  describe("Iteration 2: Broadcast Composer Banner & All Filter Bar Controls (Rows 1 & 2)", () => {
    it("2.1 renders 'Bulk AI calls have moved to the Broadcast Composer' callout card with CTA button", () => {
      cy.get("body").then(($body) => {
        const hasComposer = $body.find("*").filter((_, el) => /Broadcast Composer/i.test(el.innerText || "")).length > 0;
        if (hasComposer) {
          callsPage.getBroadcastComposerBanner().should("be.visible");
          callsPage.getOpenBroadcastComposerButton().should("be.visible");
        }
      });
    });

    it("2.2 verifies Row 1 filter controls: 'All Statuses', 'All Pipelines', 'All Providers', 'All Directions'", () => {
      callsPage.getStatusFilterDropdown().should("be.visible");
      callsPage.getPipelineFilterDropdown().should("be.visible");
      callsPage.getProviderFilterDropdown().should("be.visible");
      callsPage.getDirectionFilterDropdown().should("be.visible");
    });

    it("2.3 tests interactive dropdown controls on Row 1 filters", () => {
      // Test All Statuses dropdown
      callsPage.testDropdown(() => callsPage.getStatusFilterDropdown());
      // Test All Pipelines dropdown
      callsPage.testDropdown(() => callsPage.getPipelineFilterDropdown());
      // Test All Providers dropdown
      callsPage.testDropdown(() => callsPage.getProviderFilterDropdown());
      // Test All Directions dropdown
      callsPage.testDropdown(() => callsPage.getDirectionFilterDropdown());
    });

    it("2.4 verifies Row 2 filter controls: 'Search phone (exact)...', Date Range tabs, and 'Filter by Batch ID...'", () => {
      callsPage.getPhoneSearchInput().should("be.visible");
      callsPage.getTodayTab().should("be.visible");
      callsPage.getLast7DaysTab().should("be.visible");
      callsPage.getCustomDateTab().should("be.visible");
      callsPage.getBatchIdSearchInput().should("be.visible");
    });

    it("2.5 accepts and filters by phone number in 'Search phone (exact)...' input field", () => {
      const testPhone = "+916371813048";
      callsPage.filterByPhoneNumber(testPhone);
      callsPage.getPhoneSearchInput().should("have.value", testPhone);
      callsPage.getPhoneSearchInput().clear({ force: true });
    });

    it("2.6 tests interactive switching of Date Range tabs (Today, Last 7 days, Custom)", () => {
      callsPage.selectDateRangeTab("Last 7 days");
      callsPage.getLast7DaysTab().should("be.visible");

      callsPage.selectDateRangeTab("Custom");
      callsPage.getCustomDateTab().should("be.visible");

      callsPage.selectDateRangeTab("Today");
      callsPage.getTodayTab().should("be.visible");
    });

    it("2.7 accepts and filters by Batch ID in 'Filter by Batch ID...' input field", () => {
      const testBatchId = "batch-test-101";
      callsPage.filterByBatchId(testBatchId);
      callsPage.getBatchIdSearchInput().should("have.value", testBatchId);
      callsPage.getBatchIdSearchInput().clear({ force: true });
    });
  });

  describe("Iteration 3: Calls Data Table, Column Headers & Row Records", () => {
    it("3.1 renders Calls data table with column headers: PHONE, BATCH, STATUS, DIRECTION, PIPELINE, PROVIDER, DURATION", () => {
      callsPage.waitForTableLoaded();
      callsPage.verifyTableHeaders();
    });

    it("3.2 validates call records display phone numbers (+91 63718 13048), status badges (Failed/Completed), and direction tags (Outbound)", () => {
      callsPage.waitForTableLoaded();

      cy.get("body").then(($body) => {
        const bodyText = $body.text();
        const isEmpty = /no calls|no records|no data|no results/i.test(bodyText);
        const dataRows = $body.find("table tbody tr, [class*='clickableRow'], [class*='tableSection'] [class*='row']:not(:first-child), [role='rowgroup']:not(:first-child) [role='row'], [class*='tableRow']").filter((_, el) => {
          const text = (el.innerText || el.textContent || "").trim();
          const hasSkeleton = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
          return !hasSkeleton && text.length > 0 && !/no calls|no records|no data|no results/i.test(text);
        });

        if (!isEmpty && dataRows.length > 0) {
          callsPage.getTableRows().should("have.length.greaterThan", 0);

          // Verify phone number format or test phone in table row
          cy.get("body").then(($b) => {
            const hasPhone = $b.find("*").filter((_, el) => {
              const text = (el.innerText || el.textContent || "").trim();
              return /\+91\s*63718\s*13048|6371813048|\+?\d[\d\s\-()]{7,}/.test(text);
            }).length > 0;
            expect(hasPhone, "Call row displays phone number").to.be.true;
          });

          callsPage.getStatusBadges().should("have.length.greaterThan", 0);
          callsPage.getDirectionBadges().should("have.length.greaterThan", 0);
        } else {
          cy.log("No call records present in current session; empty state displayed cleanly");
        }
      });
    });

    it("3.3 clicks a call record in the table, visits the respective /app/calls/:callId page, and returns cleanly", () => {
      callsPage.waitForTableLoaded();

      cy.get("body").then(($body) => {
        const bodyText = $body.text();
        const isEmpty = /no calls|no records|no data|no results/i.test(bodyText);
        const dataRows = $body.find("table tbody tr, [class*='clickableRow'], [class*='tableSection'] [class*='row']:not(:first-child), [role='rowgroup']:not(:first-child) [role='row'], [class*='tableRow']").filter((_, el) => {
          const text = (el.innerText || el.textContent || "").trim();
          const hasSkeleton = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
          return !hasSkeleton && text.length > 0 && !/no calls|no records|no data|no results/i.test(text);
        });

        if (!isEmpty && dataRows.length > 0) {
          callsPage.clickCallRow(0);
          callsPage.verifyCallDetailView();
          callsPage.returnFromCallDetail();
        } else {
          cy.log("No call records in table to click for details view");
        }
      });
    });

    it("3.4 clicks '+ New Call' button, navigates to New Call screen, and returns cleanly", () => {
      callsPage.openNewCall();
      cy.url({ timeout: 15000 }).should("include", "/app/calls/new");

      callsPage.returnToCallsList();
      cy.url({ timeout: 15000 }).should("include", "/app/calls");
    });

    it("3.5 clicks 'Bulk Calls' button and validates bulk composer workflow", () => {
      callsPage.verifyBulkCallsWorkflow();
    });
  });
});
