import { loginPage } from "../../pages/LoginPage";

describe("MagickVoice Authentication — Login Page UI Components & Rendering", () => {
  beforeEach(() => {
    cy.interceptFirebaseConfig();
    cy.interceptAuthSession();
  });

  describe("1. Login Page Shell & Branding Rendering", () => {
    it("verifies page title and favicon", () => {
      loginPage.visit();
      loginPage.verifyTitle();
      loginPage.verifyFavicon();
    });

    it("renders branding logo and main container layout", () => {
      loginPage.visit();
      loginPage.getLogo().should("be.visible");
      loginPage.getContainer().should("be.visible");
    });
  });

  describe("2. Form Controls & Social Authentication Rendering", () => {
    it("renders email and password inputs with sign-in submit button", () => {
      loginPage.visit();
      loginPage.getEmailInput().should("be.visible").and("be.enabled");
      loginPage.getPasswordInput().should("be.visible").and("be.enabled");
      loginPage.getSubmitButton().should("be.visible");
    });

    it("enforces proper input field attributes and password masking", () => {
      loginPage.visit();
      loginPage.getEmailInput().should("have.attr", "type").and("match", /email|text/);
      loginPage.getPasswordInput().should("have.attr", "type", "password");
    });

    it("renders the Google Social Sign-In button with appropriate text and state", () => {
      loginPage.visit();
      loginPage.getGoogleSignInButton()
        .should("be.visible")
        .and("not.be.disabled").click();
    });
  });

  describe("3. Navigation & Helper Links Rendering", () => {
    it("renders sign-up navigation link", () => {
      loginPage.visit();
      loginPage.getSignUpLink().should("be.visible");
    });

    it("renders forgot password or help link if present in DOM", () => {
      loginPage.visit();
      cy.get("body").then(($body) => {
        const hasForgotLink = $body.find("a[href*='forgot'], a[href*='reset']").length > 0;
        if (hasForgotLink) {
          loginPage.getForgotPasswordLink().should("be.visible");
        }
      });
    });
  });

  describe("4. Form Interactivity & UI Input Handling (Client-Side)", () => {
    it("accepts input typing and reflects entered values in the DOM", () => {
      loginPage.visit();
      loginPage.setUserName("test-user@magickvoice.com");
      loginPage.getEmailInput().should("have.value", "test-user@magickvoice.com");

      loginPage.setPassword("SecretPassword123!");
      loginPage.getPasswordInput().should("have.value", "SecretPassword123!");
    });

    it("handles form interaction and submit button click via UI automation", () => {
      loginPage.visit();
      loginPage.setUserName("test-user@magickvoice.com");
      loginPage.setPassword("SecretPassword123!");
      loginPage.getSubmitButton().should("be.visible").click();
    });
  });
});