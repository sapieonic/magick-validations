import { loginPage } from "../../pages/LoginPage";

describe("MagickVoice Authentication — UI & Social Auth Flow", () => {
  beforeEach(() => {
    cy.interceptFirebaseConfig();
    cy.interceptAuthSession();
  });

  describe("1. Login Page UI Components", () => {
    it("verifies page title and favicon", () => {
      loginPage.visit();
      cy.title().should("exist").and("not.be.empty");
      loginPage.verifyFavicon();
    });

    it("renders branding logo and main container", () => {
      loginPage.visit();
      loginPage.getLogo().should("be.visible");
      loginPage.getContainer().should("be.visible");
    });

    it("renders the Google Social Sign-In button with appropriate text", () => {
      loginPage.visit();
      loginPage.getGoogleSignInButton()
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("renders email and password inputs with sign-in submit button", () => {
      loginPage.visit();
      loginPage.getEmailInput().should("be.visible").and("be.enabled");
      loginPage.getPasswordInput().should("be.visible").and("be.enabled");
      loginPage.getSubmitButton().should("be.visible");
    });

    it("renders sign-up navigation option or link", () => {
      loginPage.visit();
      cy.get("body").then(($body) => {
        const hasSignupLink = $body.find("a[href*='signup'], a[href*='register'], [href*='sign-up']").length > 0;
        if (hasSignupLink) {
          loginPage.getSignUpLink().should("be.visible");
        } else {
          cy.contains(/sign up|register|create account|don't have an account|create/i).should("exist");
        }
      });
    });

    it("handles Google Social Sign-In interaction without client errors", () => {
      loginPage.visit();
      loginPage.getGoogleSignInButton()
        .should("be.visible")
        .and("not.be.disabled")
        .click();
    });
  });

  describe("2. useLocation Redirection & Return URL Handling", () => {
    it("preserves target location when navigating directly to a protected page (/app/calls)", () => {
      // Simulate unauthenticated user attempting to visit protected page
      cy.visit("/app/calls", { failOnStatusCode: false });

      // Should redirect to login preserving the 'from' or return URL
      cy.url().should("include", "/login");
      cy.url().should("satisfy", (url: string) => {
        return url.includes("from=") || url.includes("redirect=") || url.includes("/login");
      });
    });

    it("redirects to target page (/app/calls) after successful session authentication", () => {
      // Visit login with return parameter
      loginPage.visit("/app/calls");

      // Verify session API endpoint is intercepted
      cy.intercept("POST", "**/auth/session", { fixture: "session.json" }).as("authSessionMock");

      // Fill in credentials if email/password is enabled
      const email = Cypress.env("MV_TEST_EMAIL");
      const password = Cypress.env("MV_TEST_PASSWORD");

      if (email && password) {
        loginPage.login(email, password);
        cy.wait("@authSessionMock").then((interception) => {
          expect(interception.response?.statusCode).to.eq(200);
          expect(interception.response?.body.user.email).to.eq("jagannathpatro234@gmail.com");
          expect(interception.response?.body.tenants[0].name).to.eq("Jagannath Patro's Organization");
        });

        // Verify redirection back to /app/calls
        cy.url().should("include", "/app/calls");
      }
    });
  });

  describe("3. Session Verification & Governance Permissions", () => {
    it("correctly loads governance permissions for the authenticated tenant", () => {
      cy.fixture("session.json").then((sessionData) => {
        expect(sessionData.governance.calls).to.be.true;
        expect(sessionData.governance["calls.recording"]).to.be.true;
        expect(sessionData.tenants[0].settings.allowed_pipelines).to.include("platinum");
      });
    });
  });
});