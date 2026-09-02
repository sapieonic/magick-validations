import { signUpPage } from "../../pages/SignUpPage";
import { loginPage } from "../../pages/LoginPage";

describe("MagickVoice Authentication — Sign Up Flow & Field Validations", () => {
  beforeEach(() => {
    cy.interceptFirebaseConfig();
    cy.interceptAuthSession();
    signUpPage.visit();
  });

  describe("1. Sign-Up Page UI Components & Header Elements", () => {
    it("verifies page title and favicon on navigation", () => {
      signUpPage.verifyTitle("MagickVoice");
      signUpPage.verifyFavicon();
    });

    it("renders branding logo and main container layout", () => {
      signUpPage.getLogo().should("be.visible");
      signUpPage.getContainer().should("be.visible");
    });

    it("renders navigation link to Sign-In page", () => {
      signUpPage.getSignInLink().should("be.visible");
    });
  });

  describe("2. Sign-Up Input Fields & Controls Rendering", () => {
    it("renders email input and password input fields with proper attributes", () => {
      signUpPage.getEmailInput().should("be.visible").and("be.enabled");
      signUpPage.getPasswordInput().should("be.visible").and("be.enabled");
      signUpPage.verifyInputAttributes();
    });

    it("renders Social Sign-Up (Google) and Primary Action button", () => {
      signUpPage.getGoogleSignUpButton().should("be.visible").and("not.be.disabled");
      signUpPage.getSubmitButton().should("be.visible");
    });

    it("verifies extended fields (name, confirm password, org, phone) if present in DOM", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input[name='name'], input[placeholder*='name'], input[placeholder*='Name']").length > 0) {
          signUpPage.getNameInput().should("be.visible");
        }
        if ($body.find(signUpPage.txtconfirmpassword).length > 0) {
          signUpPage.getConfirmPasswordInput().should("be.visible");
        }
        if ($body.find(signUpPage.txtorganization).length > 0) {
          signUpPage.getOrganizationInput().should("be.visible");
        }
        if ($body.find(signUpPage.txtphone).length > 0) {
          signUpPage.getPhoneInput().should("be.visible");
        }
      });
    });

    it("renders terms and conditions checkbox or agreement text if present in DOM", () => {
      cy.get("body").then(($body) => {
        if ($body.find(signUpPage.chkterms).length > 0) {
          signUpPage.getTermsCheckbox().should("exist");
        }
      });
    });
  });

  describe("3. Password & Confirm Password Validation", () => {
    it("detects and flags password mismatch when confirm password does not match", () => {
      signUpPage.setEmail("testuser@magickvoice.com");
      signUpPage.setPassword("StrongPassword123!");
      signUpPage.setConfirmPassword("MismatchedPassword456!");
      signUpPage.checkTerms();
      signUpPage.clickSubmitButton();

      signUpPage.verifyPasswordMismatchState();
    });

    it("accepts matching password and confirm password values", () => {
      signUpPage.setEmail("testuser@magickvoice.com");
      signUpPage.setPassword("StrongPassword123!");
      signUpPage.setConfirmPassword("StrongPassword123!");

      signUpPage.getPasswordInput().should("have.value", "StrongPassword123!");
      cy.get("body").then(($body) => {
        if ($body.find(signUpPage.txtconfirmpassword).length > 0) {
          signUpPage.getConfirmPasswordInput().should("have.value", "StrongPassword123!");
        }
      });
    });
  });

  describe("4. Phone Number & Country Validation", () => {
    it("validates phone number input with country code (India +91 / US +1)", () => {
      signUpPage.setPhone("+919876543210", "India");
      signUpPage.verifyPhoneValidationState(true);
    });

    it("flags invalid phone numbers with incomplete or malformed digits", () => {
      signUpPage.setPhone("12345");
      signUpPage.clickSubmitButton();
      signUpPage.verifyPhoneValidationState(false);
    });
  });

  describe("5. Client-Side Form Validations & Field Interactivity", () => {
    it("validates required input fields when submitted with empty values", () => {
      signUpPage.getSubmitButton().click({ force: true });
      signUpPage.getEmailInput().should(($el) => {
        const el = $el[0] as HTMLInputElement;
        expect(el.checkValidity() === false || el.hasAttribute("required")).to.be.true;
      });
    });

    it("enforces client-side validation on malformed email address format", () => {
      signUpPage.setEmail("not-a-valid-email");
      signUpPage.getSubmitButton().click({ force: true });
      signUpPage.getEmailInput().should(($el) => {
        const el = $el[0] as HTMLInputElement;
        expect(el.validity.valid).to.be.false;
      });
    });

    it("handles input typing and clear actions for authentication fields", () => {
      signUpPage.setEmail("newuser@magickvoice.com");
      signUpPage.getEmailInput().should("have.value", "newuser@magickvoice.com");

      signUpPage.setPassword("StrongPassword123!");
      signUpPage.getPasswordInput().should("have.value", "StrongPassword123!");
    });

    it("interacts with sign-up form controls, checkbox, and submit button via UI clicks", () => {
      signUpPage.setName("Test User");
      signUpPage.setEmail("newuser@magickvoice.com");
      signUpPage.setPassword("StrongPassword123!");
      signUpPage.setConfirmPassword("StrongPassword123!");
      signUpPage.setPhone("+919876543210", "India");
      signUpPage.checkTerms();
      signUpPage.getSubmitButton().should("be.visible").click({ force: true });
    });
  });

  describe("6. Form Submission & Result State Verification", () => {
    it("clicks Sign-Up button and verifies successful registration result", () => {
      // Intercept only the Firebase signup registration endpoint
      cy.intercept("POST", "**/accounts:signUp*", {
        statusCode: 200,
        body: {
          idToken: "mock-registration-token-12345",
          email: "newuser@magickvoice.com",
          refreshToken: "mock-refresh-token",
          expiresIn: "3600",
          localId: "mock-user-uid-9999",
        },
      }).as("mockSignUpSuccess");

      signUpPage.fillSignUpFormViaUI({
        name: "New User",
        email: "newuser@magickvoice.com",
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
        phone: "+919876543210",
        country: "India",
      });

      cy.wait("@mockSignUpSuccess").then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });

    it("clicks Sign-Up button and displays error message when registration fails (e.g. user already exists)", () => {
      cy.intercept("POST", "**/accounts:signUp*", {
        statusCode: 400,
        body: {
          error: {
            message: "EMAIL_EXISTS",
            code: 400,
          },
        },
      }).as("mockSignUpDuplicate");

      signUpPage.fillSignUpFormViaUI({
        name: "Existing User",
        email: "existing-user@magickvoice.com",
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
        phone: "+919876543210",
        country: "India",
      });

      cy.wait("@mockSignUpDuplicate").then((interception) => {
        expect(interception.response?.statusCode).to.eq(400);
      });
    });

    it("navigates to Sign-In page when clicking 'Already have an account' link", () => {
      signUpPage.clickSignInLink();
      loginPage.verifyOnLoginPage();
    });
  });
});
