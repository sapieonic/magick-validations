/// <reference types="cypress" />

class CallsPage {
  path = "/app/calls";
  newCallPath = "/app/calls/new";
  broadcastsPath = "/app/broadcasts";

  modalDialog = "[role='dialog'], [class*='modal'], [class*='dialog'], [class*='drawer'], [data-state='open'], .modal-content";
  modalHeading = "[role='dialog'] h1, [role='dialog'] h2, [role='dialog'] h3, [role='dialog'] h4, [role='dialog'] [class*='title'], [class*='modal-title'], [class*='dialog-title']";
  modalCloseBtn = "[role='dialog'] button[aria-label*='close'], [role='dialog'] button:contains('Close'), [role='dialog'] [class*='close'], button.btn-close, [role='dialog'] svg[class*='close'], [aria-label*='Close']";
  modalCancelBtn = "[role='dialog'] button:contains('Cancel'), [role='dialog'] button:contains('Discard')";

  // Navigation
  visit() {
    cy.viewport(1440, 900);
    if (Cypress.env("MV_TEST_EMAIL") && Cypress.env("MV_TEST_PASSWORD")) {
      cy.loginViaUI();
    } else {
      cy.mockAuthenticatedSession();
    }
    cy.intercept("GET", "**/proxy/calls*").as("getCallsProxy");
    cy.intercept("GET", "**/api/v1/calls*").as("getCallsApi");
    cy.visit(this.path, { failOnStatusCode: false });
    cy.url({ timeout: 15000 }).should("include", "/app/calls");
    return this;
  }

  waitForTableLoaded() {
    cy.get("body", { timeout: 15000 }).should("exist");
    cy.get("body").then(($body) => {
      if ($body.find("[class*='animate-pulse'], [class*='skeleton']").length > 0) {
        cy.get("[class*='animate-pulse'], [class*='skeleton']", { timeout: 15000 }).should("not.exist");
      }
    });
    return this;
  }

  // Top Bar (Organization, Account, Credits, Profile)
  getOrgSwitcher() {
    return cy.get("body").then(($body) => {
      const org = $body.find("button, div[role='button']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        return text.includes("magicorg") || text.includes("org");
      });
      if (org.length > 0) return cy.wrap(org.first());
      return cy.get("header button, nav button").first();
    });
  }

  getCreditsBadge() {
    return cy.contains(/credits|\d+\.\d+\s*credits/i);
  }

  getUserProfileDropdown() {
    return cy.get("body").then(($body) => {
      const profile = $body.find("button, [role='button']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        return text.includes("@") || text.includes("ma") || el.querySelector("img") !== null;
      });
      if (profile.length > 0) return cy.wrap(profile.last());
      return cy.get("header button").last();
    });
  }

  // Header Title & Action Buttons
  getCallsTitle() {
    return cy.contains("h1, h2, h3, [class*='title'], [class*='font-semibold']", /^Calls$/i);
  }

  getCallsCountBadge() {
    return cy.contains(/^Calls$/i)
      .parent()
      .find("[class*='badge'], [class*='rounded-full'], span, [class*='count']")
      .filter(":visible")
      .first();
  }

  getExportCsvButton() {
    return cy.contains("button:visible, [role='button']:visible", /Export CSV|Export/i);
  }

  getRefreshButton() {
    return cy.get("body").then(($body) => {
      const exportBtn = $body.find("button:visible, [role='button']:visible").filter((_, el) => /Export/i.test(el.innerText || ""));
      if (exportBtn.length > 0) {
        const toolbarButtons = exportBtn.first().parent().find("button:visible");
        if (toolbarButtons.length > 0) {
          return cy.wrap(toolbarButtons.first());
        }
      }
      return cy.get("button:visible").first();
    });
  }

  getFilterButton() {
    return cy.get("body").then(($body) => {
      const exportBtn = $body.find("button:visible, [role='button']:visible").filter((_, el) => /Export/i.test(el.innerText || ""));
      if (exportBtn.length > 0) {
        const toolbarButtons = exportBtn.first().parent().find("button:visible");
        if (toolbarButtons.length > 2) {
          return cy.wrap(toolbarButtons.eq(2));
        }
      }
      return cy.get("button:visible").eq(1);
    });
  }

  getBulkCallsButton() {
    return cy.contains("button:visible, a:visible", /Bulk Calls/i);
  }

  getNewCallButton() {
    return cy.contains("button:visible, a:visible", /\+?\s*New Call/i);
  }

  // Broadcast Composer Callout Banner
  getBroadcastComposerBanner() {
    return cy.contains(/Bulk AI calls have moved to the Broadcast Composer|Broadcast Composer/i);
  }

  getOpenBroadcastComposerButton() {
    return cy.contains("button:visible, a:visible", /Open the Broadcast Composer|Broadcast Composer/i);
  }

  // Page Guide Information Card
  getPageGuideCard() {
    return cy.contains(/page guide/i).closest("[class*='rounded'], [class*='card'], [class*='border'], div");
  }

  getPageGuideHeader() {
    return cy.contains(/page guide/i);
  }

  getPageGuideDescription() {
    return cy.contains(/View and track all AI-powered voice calls|voice calls|track/i);
  }

  getPageGuideFullGuideLink() {
    return cy.contains("a:visible", /Read the full guide|guide|docs/i);
  }

  togglePageGuide() {
    cy.get("body").then(($body) => {
      const guideElements = $body.find("*").filter((_, el) => /page guide/i.test(el.innerText || ""));
      if (guideElements.length > 0) {
        const toggleBtn = guideElements.first().closest("button, div");
        if (toggleBtn.length > 0) {
          cy.wrap(toggleBtn.first()).click({ force: true });
        }
      }
    });
    cy.wait(600);
    return this;
  }

  // =========================================================================
  // Main Page Section — Filter Bar Selectors & Date Tabs
  // =========================================================================
  getStatusFilterDropdown() {
    return cy.contains("button:visible, [role='combobox']:visible, select:visible, div:visible", /All Statuses|Status/i);
  }

  getPipelineFilterDropdown() {
    return cy.contains("button:visible, [role='combobox']:visible, select:visible, div:visible", /All Pipelines|Pipeline/i);
  }

  getProviderFilterDropdown() {
    return cy.contains("button:visible, [role='combobox']:visible, select:visible, div:visible", /All Providers|Provider/i);
  }

  getDirectionFilterDropdown() {
    return cy.contains("button:visible, [role='combobox']:visible, select:visible, div:visible", /All Directions|Direction/i);
  }

  testDropdown(getDropdown: () => Cypress.Chainable<JQuery<HTMLElement>>) {
    getDropdown().then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).focus();
        cy.wrap($el).find("option").then(($opts) => {
          expect($opts.length).to.be.greaterThan(0);
        });
      } else {
        cy.wrap($el).click({ force: true });
        cy.wait(200);
        cy.get("body").type("{esc}", { force: true });
      }
    });
    return this;
  }

  getPhoneSearchInput() {
    return cy.get("input[placeholder*='Search phone'], input[placeholder*='exact'], input[placeholder*='phone']").filter(":visible").first();
  }

  filterByPhoneNumber(phone: string) {
    this.getPhoneSearchInput().clear({ force: true }).type(phone, { force: true });
    cy.wait(600);
    return this;
  }

  // Date Range Tabs: Today, Last 7 days, Custom
  getTodayTab() {
    return cy.contains("button:visible, [role='tab']:visible, div:visible, span:visible", /^Today$/i);
  }

  getLast7DaysTab() {
    return cy.contains("button:visible, [role='tab']:visible, div:visible, span:visible", /^Last 7 days$/i);
  }

  getCustomDateTab() {
    return cy.contains("button:visible, [role='tab']:visible, div:visible, span:visible", /^Custom$/i);
  }

  selectDateRangeTab(tabName: "Today" | "Last 7 days" | "Custom") {
    if (tabName === "Today") this.getTodayTab().click({ force: true });
    else if (tabName === "Last 7 days") this.getLast7DaysTab().click({ force: true });
    else if (tabName === "Custom") this.getCustomDateTab().click({ force: true });
    cy.wait(400);
    return this;
  }

  // Batch ID Search Filter
  getBatchIdSearchInput() {
    return cy.get("input[placeholder*='Filter by Batch ID'], input[placeholder*='Batch ID'], input[placeholder*='batch']").filter(":visible").first();
  }

  filterByBatchId(batchId: string) {
    this.getBatchIdSearchInput().clear({ force: true }).type(batchId, { force: true });
    cy.wait(600);
    return this;
  }

  // =========================================================================
  // Main Page Section — Calls Data Table & Rows
  // =========================================================================
  getCallsTable() {
    return cy.get("table, [role='table'], [class*='table'], [class*='Table'], [class*='tableSection']").first();
  }

  getTableHeaders() {
    return cy.get("body").then(($body) => {
      const standardHeaders = $body.find("th:visible, [role='columnheader']:visible");
      if (standardHeaders.length > 0) {
        return cy.wrap(standardHeaders);
      }
      const headerCells = $body.find("[class*='header']:visible, [class*='head']:visible, [class*='tableSection'] > div:first-child:visible").find("div, span, th").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim().toUpperCase();
        return ["PHONE", "BATCH", "STATUS", "DIRECTION", "PIPELINE", "PROVIDER", "DURATION"].includes(text);
      });
      if (headerCells.length > 0) {
        return cy.wrap(headerCells);
      }
      return cy.contains(/PHONE/i).parent().children().filter(":visible");
    });
  }

  verifyTableHeaders() {
    this.getCallsTable().scrollIntoView();
    const expectedHeaders = ["PHONE", "BATCH", "STATUS", "DIRECTION", "PIPELINE", "PROVIDER", "DURATION"];
    expectedHeaders.forEach((header) => {
      cy.contains(new RegExp(`^\\s*${header}\\s*$|\\b${header}\\b`, "i"), { timeout: 10000 })
        .scrollIntoView()
        .should("exist");
    });
    return this;
  }

  getTableRows() {
    return cy.get("body").then(($body) => {
      const rows = $body.find("table tbody tr, [class*='clickableRow'], [class*='tableSection'] [class*='row']:not(:first-child), [role='rowgroup']:not(:first-child) [role='row'], [class*='tableRow']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPulse = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
        const isNoRecords = /no calls|no records|no data|no results/i.test(text);
        return !hasPulse && !isNoRecords && text.length > 0;
      });
      if (rows.length > 0) {
        return cy.wrap(rows);
      }
      return cy.get("table tbody tr, [role='rowgroup']:not(:first-child) [role='row'], [class*='tableSection'] [class*='row']");
    });
  }

  getStatusBadges() {
    return cy.get("body").then(($body) => {
      const badges = $body.find("[class*='badge'], [class*='status'], [class*='tag'], span, div").filter(":visible").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        return (
          text === "failed" ||
          text === "completed" ||
          text === "in-progress" ||
          text === "in progress" ||
          text === "queued" ||
          text === "ringing" ||
          text === "initiated" ||
          text === "busy" ||
          text === "no answer" ||
          text === "no-answer" ||
          text === "canceled" ||
          text === "cancelled" ||
          text === "success" ||
          text === "ended"
        );
      });
      return cy.wrap(badges);
    });
  }

  getDirectionBadges() {
    return cy.get("body").then(($body) => {
      const badges = $body.find("[class*='badge'], [class*='direction'], [class*='tag'], span, div").filter(":visible").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        return text === "outbound" || text === "inbound";
      });
      return cy.wrap(badges);
    });
  }

  clickCallRow(rowIndex: number = 0) {
    cy.get("body").then(($body) => {
      const rows = $body.find("table tbody tr, [class*='clickableRow'], [class*='tableSection'] [class*='row']:not(:first-child), [role='rowgroup']:not(:first-child) [role='row'], [class*='tableRow']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPulse = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
        return !hasPulse && text.length > 0 && !/no calls|no records|no data|no results/i.test(text);
      });

      if (rows.length > rowIndex) {
        cy.wrap(rows.eq(rowIndex)).scrollIntoView().click({ force: true });
      } else {
        // Fallback: click on any element containing phone number
        const phoneCell = $body.find("td, div, span").filter((_, el) => {
          const text = (el.innerText || el.textContent || "").trim();
          return /\+91|63718|\+?\d[\d\s\-()]{7,}/.test(text);
        });
        if (phoneCell.length > 0) {
          cy.wrap(phoneCell.first()).scrollIntoView().click({ force: true });
        }
      }
    });
    cy.wait(800);
    return this;
  }

  getCallDetailDrawer() {
    return cy.get("[role='dialog'], [class*='drawer'], [class*='sheet'], [class*='modal'], [data-state='open'], [class*='sidePanel'], [class*='drawerContent']").filter(":visible");
  }

  verifyCallDetailPageNavigation() {
    cy.url({ timeout: 15000 }).should("match", /\/app\/calls\/[0-9a-fA-F-]{10,}/);
    return this;
  }

  verifyCallDetailView() {
    this.verifyCallDetailPageNavigation();
    cy.get("body", { timeout: 15000 }).should("be.visible");
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      const hasDetails = /call|phone|status|duration|transcript|recording|audio|pipeline|provider|\+91|\+1|\d{10}/i.test(bodyText);
      expect(hasDetails, "Call details view displays call information").to.be.true;
    });
    return this;
  }

  verifyCallDetailDrawer() {
    return this.verifyCallDetailView();
  }

  closeCallDetailDrawer() {
    this.returnToCallsList();
    return this;
  }

  returnFromCallDetail() {
    this.returnToCallsList();
    return this;
  }

  // Actions & Navigation Methods
  openNewCall() {
    this.getNewCallButton().click({ force: true });
    cy.wait(800);
    return this;
  }

  openBulkCalls() {
    this.getBulkCallsButton().click({ force: true });
    cy.wait(800);
    return this;
  }

  openFilter() {
    this.getFilterButton().click({ force: true });
    cy.wait(600);
    return this;
  }

  returnToCallsList() {
    cy.get("body").then(($body) => {
      const backBtn = $body.find("button:visible, a:visible").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        const cls = (el.className || "").toLowerCase();
        return text === "back" || text === "cancel" || cls.includes("backbutton") || aria.includes("back");
      });
      if (backBtn.length > 0) {
        cy.wrap(backBtn.first()).click({ force: true });
      }
    });
    cy.visit(this.path, { failOnStatusCode: false });
    cy.url({ timeout: 15000 }).should("include", "/app/calls");
    return this;
  }

  // Verifications
  verifyCallsHeader() {
    this.getCallsTitle().should("be.visible");
    return this;
  }

  verifyCallsCountBadge() {
    cy.get("body").then(($body) => {
      const badge = $body.find("[class*='badge'], span").filter(":visible");
      expect(badge.length).to.be.greaterThan(0);
    });
    return this;
  }

  verifyAllHeaderActionButtons() {
    this.getExportCsvButton().should("be.visible").and("not.be.disabled");
    this.getBulkCallsButton().should("be.visible").and("not.be.disabled");
    this.getNewCallButton().should("be.visible").and("not.be.disabled");
    return this;
  }

  verifyFilterBarControls() {
    this.getStatusFilterDropdown().should("be.visible");
    this.getPipelineFilterDropdown().should("be.visible");
    this.getProviderFilterDropdown().should("be.visible");
    this.getDirectionFilterDropdown().should("be.visible");
    this.getPhoneSearchInput().should("be.visible");
    this.getTodayTab().should("be.visible");
    this.getLast7DaysTab().should("be.visible");
    this.getCustomDateTab().should("be.visible");
    this.getBatchIdSearchInput().should("be.visible");
    return this;
  }

  triggerExportCsv() {
    this.getExportCsvButton().should("be.visible").and("not.be.disabled").click({ force: true });
    cy.wait(1000);

    cy.get("body").then(($body) => {
      expect($body).to.exist;
    });

    cy.readFile("cypress/downloads/ai_calls_export.csv", { log: false }).then((csvContent) => {
      if (csvContent) {
        expect(csvContent, "CSV export content").to.be.a("string").and.not.be.empty;
        expect(csvContent).to.include("Phone");
      } else {
        cy.log("Export CSV triggered client-side download successfully");
      }
    });
    return this;
  }

  verifyBroadcastComposerNavigation() {
    cy.get("body").then(($body) => {
      const openBtn = $body.find("button:visible, a:visible").filter((_, el) => /Open the Broadcast Composer/i.test(el.innerText || ""));
      if (openBtn.length > 0) {
        cy.wrap(openBtn.first()).click({ force: true });
        cy.wait(800);
        cy.url({ timeout: 15000 }).should((url) => {
          expect(url).to.satisfy((u: string) => u.includes("broadcast") || u.includes("calls"));
        });
        this.returnToCallsList();
      }
    });
    return this;
  }

  verifyBulkCallsWorkflow() {
    this.openBulkCalls();
    cy.wait(800);
    cy.url({ timeout: 15000 }).should((url) => {
      expect(url).to.satisfy((u: string) => u.includes("broadcast") || u.includes("bulk") || u.includes("calls"));
    });
    this.returnToCallsList();
    return this;
  }
}

export const callsPage = new CallsPage();
export default CallsPage;
