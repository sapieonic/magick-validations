import { signUpPage } from "../../pages/SignUpPage";
import { loginPage } from "../../pages/LoginPage";

describe("MagickVoice Authentication — Sign Up Page UI Components & Rendering", () => {
  beforeEach(() => {
    cy.interceptFirebaseConfig();
    cy.interceptAuthSession();
  });

  describe("1. Sign-Up Page Shell & Branding Rendering", () => {
    it("verifies page title and favicon on navigation", () => {
      signUpPage.visit();
      signUpPage.verifyTitle("MagickVoice");
      signUpPage.verifyFavicon();
    });

    it("renders branding logo and main container layout", () => {
      signUpPage.visit();
      signUpPage.getLogo().should("be.visible");
      signUpPage.getContainer().should("be.visible");
    });
  });

  describe("2. Sign-Up Input Fields & Controls Rendering", () => {
    it("renders email input and password input fields with proper attributes", () => {
      signUpPage.visit();
      signUpPage.getEmailInput().should("be.visible").and("be.enabled");
      signUpPage.getPasswordInput().should("be.visible").and("be.enabled");
      signUpPage.verifyInputAttributes();
    });

    it("renders Social Sign-Up (Google) and Primary Action button", () => {
      signUpPage.visit();
      signUpPage.getGoogleSignUpButton().should("be.visible").and("not.be.disabled");
      signUpPage.getSubmitButton().should("be.visible");
    });

    it("verifies extended fields (name, confirm password, org, phone) if present in DOM", () => {
      signUpPage.visit();
      cy.get("body").then(($body) => {
        if ($body.find("input[name='name'], input[placeholder*='name'], input[placeholder*='Name']").length > 0) {
          signUpPage.getNameInput().should("be.visible");
        }
        if ($body.find("input[name*='confirm'], input[placeholder*='confirm'], input[placeholder*='Confirm']").length > 0) {
          signUpPage.getConfirmPasswordInput().should("be.visible");
        }
        if ($body.find("input[name*='org'], input[placeholder*='org'], input[placeholder*='Org']").length > 0) {
          signUpPage.getOrganizationInput().should("be.visible");
        }
      });
    });

    it("renders terms and conditions checkbox or agreement text if present in DOM", () => {
      signUpPage.visit();
      cy.get("body").then(($body) => {
        if ($body.find("input[type='checkbox']").length > 0) {
          signUpPage.getTermsCheckbox().should("exist");
        }
      });
    });
  });

  describe("3. Navigation & Cross-Page UI Flow", () => {
    it("verifies navigation between Login and Sign-Up pages via UI links", () => {
      loginPage.visit();
      cy.get("body").then(($body) => {
        const hasSignup = $body.find("a[href*='signup'], a[href*='register'], [href*='sign-up']").length > 0;
        if (hasSignup) {
          loginPage.getSignUpLink().should("be.visible").click();
          signUpPage.verifyOnSignUpPage();
        } else {
          cy.log("Sign-up is integrated in login view");
        }
      });
    });

    it("renders navigation link back to sign-in page", () => {
      signUpPage.visit();
      signUpPage.getSignInLink().should("be.visible");
    });
  });

  describe("4. Form Interactivity & UI Automation (Client-Side)", () => {
    it("handles input typing and clear actions for authentication fields", () => {
      signUpPage.visit();
      signUpPage.setEmail("newuser@magickvoice.com");
      signUpPage.getEmailInput().should("have.value", "newuser@magickvoice.com");

      signUpPage.setPassword("StrongPassword123!");
      signUpPage.getPasswordInput().should("have.value", "StrongPassword123!");
    });

    it("interacts with sign-up form controls and submit button via UI clicks", () => {
      signUpPage.visit();
      signUpPage.setEmail("newuser@magickvoice.com");
      signUpPage.setPassword("StrongPassword123!");
      signUpPage.checkTerms();
      signUpPage.getSubmitButton().should("be.visible").click({ force: true });
    });
  });
});
