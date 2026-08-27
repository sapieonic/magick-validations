/// <reference types="cypress" />

class CallsPage {
  path = "/app/calls";

  // Navigation
  visit() {
    if (Cypress.env("MV_TEST_EMAIL") && Cypress.env("MV_TEST_PASSWORD")) {
      cy.loginViaUI();
    } else {
      cy.mockAuthenticatedSession();
    }
    cy.visit(this.path, { failOnStatusCode: false });
    return this;
  }

  // Header Getters
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

  // Top Action Buttons (Toolbar)
  getExportCsvButton() {
    return cy.contains("button:visible, [role='button']:visible", /Export CSV|Export/i);
  }

  getRefreshButton() {
    return cy.contains("button:visible", /Export CSV|Export/i)
      .parent()
      .find("button:visible")
      .first();
  }

  getFilterButton() {
    return cy.contains("button:visible", /Export CSV|Export/i)
      .parent()
      .find("button:visible")
      .filter((_, el) => {
        const text = (el.innerText || "").trim().toLowerCase();
        return !text.includes("export") && !text.includes("bulk") && !text.includes("new");
      })
      .last();
  }

  getBulkCallsButton() {
    return cy.contains("button:visible, a:visible", /Bulk Calls/i);
  }

  getNewCallButton() {
    return cy.contains("button:visible, a:visible", /\+?\s*New Call/i);
  }

  // Page Guide (Information Card) Getters
  getPageGuideCard() {
    return cy.contains("PAGE GUIDE").closest("[class*='rounded'], [class*='card'], [class*='border'], div");
  }

  getPageGuideHeader() {
    return cy.contains(/PAGE GUIDE/i);
  }

  getPageGuideDescription() {
    return cy.contains(/View and track all AI-powered voice calls/i);
  }

  getPageGuideFullGuideLink() {
    return cy.contains("a:visible", /Read the full guide/i);
  }

  togglePageGuide() {
    cy.contains("PAGE GUIDE")
      .closest("div")
      .parent()
      .find("button:visible, svg:visible")
      .last()
      .click({ force: true });
    return this;
  }

  // Validations & Assertions
  verifyCallsHeader() {
    this.getCallsTitle().should("be.visible");
    return this;
  }

  verifyCallsCountBadge() {
    this.getCallsCountBadge().should("be.visible");
    return this;
  }

  verifyAllHeaderActionButtons() {
    this.getRefreshButton().should("be.visible");
    this.getExportCsvButton().should("be.visible").and("not.be.disabled");
    this.getBulkCallsButton().should("be.visible").and("not.be.disabled");
    this.getNewCallButton().should("be.visible").and("not.be.disabled");
    return this;
  }

  verifyPageGuideInformationCard() {
    this.getPageGuideHeader().should("be.visible");
    this.getPageGuideDescription().should("be.visible");
    this.getPageGuideFullGuideLink().should("be.visible").and("have.attr", "href");
    return this;
  }

  verifyPageGuideBulletTips() {
    // Assert all 4 instructional bullet points visible inside Page Guide
    cy.contains(/status filter/i, { timeout: 10000 }).should("be.visible");
    cy.contains(/full call details/i, { timeout: 10000 }).should("be.visible");
    cy.contains(/auto-refreshes/i, { timeout: 10000 }).should("be.visible");
    cy.contains(/Broadcast Composer/i, { timeout: 10000 }).should("be.visible");
    return this;
  }
}

export const callsPage = new CallsPage();
export default CallsPage;
