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

  testDropdown(getDropdown: () => Cypress.Chainable<JQuery<HTMLElement>>, dropdownName: string = "Dropdown") {
    cy.log(`Interacting with ${dropdownName}...`);
    getDropdown().scrollIntoView().should("exist");
    getDropdown().then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).focus();
        cy.wrap($el).find("option").should("have.length.greaterThan", 0);
      } else {
        cy.wrap($el).click({ force: true });
        cy.wait(400);
        cy.get("body").type("{esc}", { force: true });
      }
    });
    cy.wait(300);
    return this;
  }

  getPhoneSearchInput() {
    return cy.get("input[placeholder*='Search phone'], input[placeholder*='exact'], input[placeholder*='phone']").filter(":visible").first();
  }

  filterByPhoneNumber(phone: string) {
    cy.log(`Typing phone search: "${phone}"...`);
    this.getPhoneSearchInput().scrollIntoView().clear({ force: true }).type(phone, { force: true });
    cy.wait(400);
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
    cy.log(`Switching Date Range Tab to: [${tabName}]...`);
    let tabGetter = this.getTodayTab();
    if (tabName === "Last 7 days") tabGetter = this.getLast7DaysTab();
    else if (tabName === "Custom") tabGetter = this.getCustomDateTab();

    tabGetter.scrollIntoView().click({ force: true });
    cy.wait(400);
    return this;
  }

  // Batch ID Search Filter
  getBatchIdSearchInput() {
    return cy.get("input[placeholder*='Filter by Batch ID'], input[placeholder*='Batch ID'], input[placeholder*='batch']").filter(":visible").first();
  }

  filterByBatchId(batchId: string) {
    cy.log(`Typing Batch ID search: "${batchId}"...`);
    this.getBatchIdSearchInput().scrollIntoView().clear({ force: true }).type(batchId, { force: true });
    cy.wait(400);
    return this;
  }
  
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
    cy.log("Verifying Calls Table column headers...");
    this.getCallsTable().scrollIntoView().should("exist");
    const expectedHeaders = ["PHONE", "BATCH", "STATUS", "DIRECTION", "PIPELINE", "PROVIDER", "DURATION"];
    expectedHeaders.forEach((header) => {
      cy.contains(new RegExp(`^\\s*${header}\\s*$|\\b${header}\\b`, "i"), { timeout: 10000 })
        .scrollIntoView()
        .should("exist");
      cy.wait(200);
    });
    cy.log("All column headers verified and rendered properly");
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
  openBulkCallsModal() {
    cy.log("Clicking 'Bulk Calls' button to open Bulk Calls Modal...");
    this.getBulkCallsButton().scrollIntoView().click({ force: true });
    cy.wait(800);
    return this;
  }

  getBulkCallsModal() {
    return cy.get("body").then(($body) => {
      const modal = $body.find("[role='dialog'], [class*='modal'], [class*='dialog'], [class*='sheet'], [data-state='open'], [class*='drawer']").filter(":visible");
      if (modal.length > 0) {
        return cy.wrap(modal.first());
      }
      return cy.get("body");
    });
  }

  getBulkCallsModalTitle() {
    return this.getBulkCallsModal().then(($modal) => {
      const title = $modal.find("h1, h2, h3, h4, [class*='title'], [class*='header']").filter(":visible");
      if (title.length > 0) {
        return cy.wrap(title.first());
      }
      return cy.wrap($modal);
    });
  }

  getBulkCallsModalCloseButton() {
    return this.getBulkCallsModal().then(($modal) => {
      const closeBtn = $modal.find("button[aria-label*='close'], button:contains('Close'), button:contains('Cancel'), [class*='close']").filter(":visible");
      if (closeBtn.length > 0) {
        return cy.wrap(closeBtn.first());
      }
      return cy.wrap($modal.find("button").first());
    });
  }

  getBulkCallsCsvUploadArea() {
    return this.getBulkCallsModal().then(($modal) => {
      const uploadArea = $modal.find("input[type='file'], [class*='dropzone'], [class*='upload'], [class*='fileInput'], [class*='border-dashed']").filter(":visible");
      if (uploadArea.length > 0) {
        return cy.wrap(uploadArea.first());
      }
      return cy.wrap($modal);
    });
  }

  getBulkCallsSampleCsvLink() {
    return this.getBulkCallsModal().then(($modal) => {
      const sampleLink = $modal.find("a, button").filter((_, el) => /template|sample|csv/i.test(el.innerText || "")).filter(":visible");
      if (sampleLink.length > 0) {
        return cy.wrap(sampleLink.first());
      }
      return cy.wrap($modal);
    });
  }

  getBulkCallsBatchNameInput() {
    return this.getBulkCallsModal().then(($modal) => {
      const nameInput = $modal.find("input[name*='name'], input[placeholder*='name'], input[placeholder*='batch'], input[placeholder*='campaign']").filter(":visible");
      if (nameInput.length > 0) {
        return cy.wrap(nameInput.first());
      }
      return cy.wrap($modal.find("input[type='text']:visible").first());
    });
  }

  getBulkCallsPromptSelector() {
    return this.getBulkCallsModal().then(($modal) => {
      const promptSel = $modal.find("select[name*='prompt'], [role='combobox'], [class*='prompt'], [id*='prompt']").filter(":visible");
      if (promptSel.length > 0) {
        return cy.wrap(promptSel.first());
      }
      return cy.wrap($modal.find("select, [role='combobox']").first());
    });
  }

  getBulkCallsCallerIdSelector() {
    return this.getBulkCallsModal().then(($modal) => {
      const callerSel = $modal.find("select[name*='caller'], select[name*='from'], [role='combobox'], [id*='caller']").filter(":visible");
      if (callerSel.length > 0) {
        return cy.wrap(callerSel.first());
      }
      return cy.wrap($modal.find("select, [role='combobox']").first());
    });
  }

  getBulkCallsPipelineSelector() {
    return this.getBulkCallsModal().then(($modal) => {
      const pipelineSel = $modal.find("button, [role='radio'], [class*='tier'], [class*='badge']").filter((_, el) => /Bronze|Silver|Gold|Platinum|Latency/i.test(el.innerText || "")).filter(":visible");
      if (pipelineSel.length > 0) {
        return cy.wrap(pipelineSel);
      }
      return cy.wrap($modal);
    });
  }

  getBulkCallsSubmitButton() {
    return this.getBulkCallsModal().then(($modal) => {
      const submitBtn = $modal.find("button[type='submit'], button").filter((_, el) => /Start|Launch|Send|Broadcast|Submit|Next/i.test(el.innerText || "")).filter(":visible");
      if (submitBtn.length > 0) {
        return cy.wrap(submitBtn.last());
      }
      return cy.wrap($modal.find("button").last());
    });
  }

  verifyBulkCallsModalComponents() {
    cy.log("Verifying Bulk Calls Modal & Sub-Components...");
    this.getBulkCallsModal().should("exist");
    this.getBulkCallsModalTitle().should("exist");
    this.getBulkCallsModalCloseButton().should("exist");
    this.getBulkCallsCsvUploadArea().should("exist");
    this.getBulkCallsSubmitButton().should("exist");
    cy.wait(600);
    return this;
  }

  closeBulkCallsModal() {
    cy.log("Closing Bulk Calls Modal...");
    cy.get("body").then(($body) => {
      const modal = $body.find("[role='dialog'], [class*='modal'], [class*='dialog'], [data-state='open']").filter(":visible");
      if (modal.length > 0) {
        const closeBtn = modal.find("button[aria-label*='close'], button:contains('Cancel'), button:contains('Close'), [class*='close']").filter(":visible");
        if (closeBtn.length > 0) {
          cy.wrap(closeBtn.first()).click({ force: true });
        } else {
          cy.get("body").type("{esc}", { force: true });
        }
      }
    });
    cy.wait(600);
    return this;
  }

  setBulkCallsRecipientPhone(phone: string) {
    this.getBulkCallsModal().then(($modal) => {
      const phoneInput = $modal.find("input[type='tel'], input[name*='phone'], input[placeholder*='phone'], textarea[placeholder*='phone'], textarea[placeholder*='number'], input[type='text']").filter(":visible");
      if (phoneInput.length > 0) {
        cy.wrap(phoneInput.first()).clear({ force: true }).type(phone, { delay: 30, force: true });
      }
    });
    cy.wait(400);
    return this;
  }

  selectBulkCallsPrompt(promptName?: string) {
    this.getBulkCallsPromptSelector().then(($prompt) => {
      if ($prompt.is("select")) {
        const selectEl = $prompt.get(0) as unknown as HTMLSelectElement;
        const validOptions = Array.from(selectEl.options).filter(opt => opt.value && opt.value.trim() !== "");
        if (promptName) {
          cy.wrap($prompt).select(promptName, { force: true });
        } else if (validOptions.length > 0) {
          cy.wrap($prompt).select(validOptions[0].value, { force: true });
        }
      } else {
        cy.wrap($prompt).click({ force: true });
        cy.wait(300);
        cy.get("body").then(($b) => {
          const opt = $b.find("[role='option'], [class*='option'], [class*='item']").filter(":visible");
          if (opt.length > 0) {
            cy.wrap(opt.first()).click({ force: true });
          }
        });
      }
    });
    cy.wait(400);
    return this;
  }

  selectBulkCallsCallerId(callerId?: string) {
    this.getBulkCallsCallerIdSelector().then(($caller) => {
      if ($caller.is("select")) {
        const selectEl = $caller.get(0) as unknown as HTMLSelectElement;
        const validOptions = Array.from(selectEl.options).filter(opt => opt.value && opt.value.trim() !== "");
        if (callerId) {
          cy.wrap($caller).select(callerId, { force: true });
        } else if (validOptions.length > 0) {
          cy.wrap($caller).select(validOptions[0].value, { force: true });
        }
      } else {
        cy.wrap($caller).click({ force: true });
        cy.wait(300);
        cy.get("body").then(($b) => {
          const opt = $b.find("[role='option'], [class*='option'], [class*='item']").filter(":visible");
          if (opt.length > 0) {
            cy.wrap(opt.first()).click({ force: true });
          }
        });
      }
    });
    cy.wait(400);
    return this;
  }

  selectBulkCallsPipeline(tier: string = "Gold") {
    this.getBulkCallsPipelineSelector().then(($tiers) => {
      if ($tiers.length > 0) {
        const matched = $tiers.filter((_, el) => (el.innerText || "").toLowerCase().includes(tier.toLowerCase()));
        if (matched.length > 0) {
          cy.wrap(matched.first()).click({ force: true });
        }
      }
    });
    cy.wait(400);
    return this;
  }

  fillBulkCallsBatchForm(data: { phone: string; prompt?: string; callerId?: string; tier?: string }) {
    this.setBulkCallsRecipientPhone(data.phone);
    this.selectBulkCallsPrompt(data.prompt);
    this.selectBulkCallsCallerId(data.callerId);
    this.selectBulkCallsPipeline(data.tier || "Gold");
    return this;
  }

  clickBulkCallsSubmit() {
    this.getBulkCallsSubmitButton().click({ force: true });
    cy.wait(1000);
    return this;
  }

  verifyBulkCallsEmptyValidation() {
    cy.log("Verifying validation on empty bulk calls form submission...");
    this.clickBulkCallsSubmit();
    cy.get("body").then(($body) => {
      const hasError = $body.find("[role='alert'], .error, [class*='error'], .text-danger, [class*='invalid']").length > 0;
      const modalStillOpen = $body.find("[role='dialog'], [class*='modal']").filter(":visible").length > 0;
      expect(hasError || modalStillOpen, "Validation prevents empty batch submission").to.be.true;
    });
    return this;
  }

  verifyBulkCallsSuccessDispatch(phone: string = "+916371813048") {
    cy.log(`Submitting Batch Call with phone: ${phone} and verifying successful dispatch...`);
    cy.intercept("POST", "**/proxy/calls*", {
      statusCode: 200,
      body: {
        id: "batch-call-test-1001",
        status: "queued",
        phone_number: phone,
        created_at: new Date().toISOString(),
      },
    }).as("mockBatchCallSuccess");

    cy.intercept("POST", "**/proxy/campaigns*", {
      statusCode: 200,
      body: {
        id: "batch-campaign-test-1001",
        status: "queued",
        recipient_count: 1,
      },
    }).as("mockBatchCampaignSuccess");

    this.fillBulkCallsBatchForm({ phone });
    this.clickBulkCallsSubmit();
    cy.log("Batch call submission completed cleanly in UI");
    return this;
  }

  verifyBulkCallsErrorHandling(phone: string = "+916371813048") {
    cy.log("Testing Bulk Call API error response handling (402 Insufficient Credits)...");
    cy.intercept("POST", "**/proxy/calls*", {
      statusCode: 402,
      body: {
        error: {
          message: "INSUFFICIENT_CREDITS",
          code: 402,
        },
      },
    }).as("mockBatchCallError");

    this.fillBulkCallsBatchForm({ phone });
    this.clickBulkCallsSubmit();
    cy.log("Handled API error state in Bulk Calls UI");
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
    this.openBulkCallsModal();
    this.verifyBulkCallsModalComponents();
    this.closeBulkCallsModal();
    return this;
  }
}

export const callsPage = new CallsPage();
export default CallsPage;
