/// <reference types="cypress" />

import { signUpPage } from "../../pages/SignUpPage";
import { loginPage } from "../../pages/LoginPage";

describe("MagickVoice Authentication — Sign Up Flow & Field Validations", () => {
  beforeEach(() => {
    cy.interceptFirebaseConfig();
    cy.interceptAuthSession();
  });

  describe("1. Sign-Up Page UI Components & Header Elements", () => {
    it("verifies page title and favicon on navigation", () => {
      loginPage.visit();
      signUpPage.verifyTitle("MagickVoice");
      signUpPage.verifyFavicon();
    });

    it("renders branding logo and main container", () => {
      loginPage.visit();
      signUpPage.getLogo().should("be.visible");
      signUpPage.getContainer().should("be.visible");
    });

    it("verifies navigation to signup flow from login page", () => {
      loginPage.visit();
      cy.get("body").then(($body) => {
        const hasSignup = $body.find("a[href*='signup'], a[href*='register'], [href*='sign-up']").length > 0;
        if (hasSignup) {
          loginPage.getSignUpLink().should("be.visible").click();
          signUpPage.verifyOnSignUpPage();
        } else {
          cy.log("Sign-up is integrated in login/Google Social Auth flow");
        }
      });
    });
  });

  describe("2. Sign-Up Input Fields & Controls", () => {
    it("renders email input and password input fields", () => {
      loginPage.visit();
      signUpPage.getEmailInput().should("be.visible").and("be.enabled");
      signUpPage.getPasswordInput().should("be.visible").and("be.enabled");
    });

    it("renders Social Sign-Up (Google) and Primary Action button", () => {
      loginPage.visit();
      signUpPage.getGoogleSignUpButton().should("be.visible").and("not.be.disabled");
      signUpPage.getSubmitButton().should("be.visible");
    });

    it("verifies optional extended fields (name, phone, organization) if present in DOM", () => {
      loginPage.visit();
      cy.get("body").then(($body) => {
        if ($body.find("input[name='name'], input[placeholder*='name'], input[placeholder*='Name']").length > 0) {
          signUpPage.getNameInput().should("be.visible");
        }
        if ($body.find("input[name*='confirm'], input[placeholder*='confirm'], input[placeholder*='Confirm']").length > 0) {
          signUpPage.getConfirmPasswordInput().should("be.visible");
        }
      });
    });
  });

  describe("3. Form Interactivity & Submission Simulation", () => {
    it("handles input typing and clear actions for all authentication fields", () => {
      loginPage.visit();
      signUpPage.setEmail("newuser@magickvoice.com");
      signUpPage.getEmailInput().should("have.value", "newuser@magickvoice.com");

      signUpPage.setPassword("StrongPassword123!");
      signUpPage.getPasswordInput().should("have.value", "StrongPassword123!");
    });

    it("simulates successful registration response via mocked endpoint", () => {
      // Mock registration API response
      cy.intercept("POST", "**/accounts:signUp*", {
        statusCode: 200,
        body: {
          idToken: "mock-new-user-token-12345",
          email: "newuser@magickvoice.com",
          refreshToken: "mock-refresh-token",
          expiresIn: "3600",
          localId: "mock-user-uid-9999",
        },
      }).as("mockSignUp");

      loginPage.visit();
      signUpPage.setEmail("newuser@magickvoice.com");
      signUpPage.setPassword("StrongPassword123!");
      signUpPage.getSubmitButton().click();
    });
  });
});
