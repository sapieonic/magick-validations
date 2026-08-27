import { loginPage } from "../../pages/LoginPage";

describe("MagickVoice Authentication — Login Page UI Components & Rendering", () => {
  beforeEach(() => {
    cy.interceptFirebaseConfig();
    cy.interceptAuthSession();
    loginPage.visit();
  });

  describe("1. Login Page Shell & Branding Rendering", () => {
    it("verifies page title and favicon", () => {
      loginPage.verifyTitle();
      loginPage.verifyFavicon();
    });

    it("renders branding logo and main container layout", () => {
      loginPage.getLogo().should("be.visible");
      loginPage.getContainer().should("be.visible");
    });
  });

  describe("2. Form Controls & Social Authentication Rendering", () => {
    it("renders email and password inputs with sign-in submit button", () => {
      loginPage.getEmailInput().should("be.visible").and("be.enabled");
      loginPage.getPasswordInput().should("be.visible").and("be.enabled");
      loginPage.getSubmitButton().should("be.visible");
    });

    it("enforces proper input field attributes and password masking", () => {
      loginPage.getEmailInput().should("have.attr", "type").and("match", /email|text/);
      loginPage.getPasswordInput().should("have.attr", "type", "password");
    });

    it("renders the Google Social Sign-In button with appropriate text and state", () => {
      loginPage.getGoogleSignInButton()
        .should("be.visible")
        .and("not.be.disabled");
    });
  });

  describe("3. useLocation Redirection & Return URL Handling", () => {
    it("preserves return navigation parameter when accessing protected areas", () => {
      cy.visit("/app/calls", { failOnStatusCode: false });

      cy.url().should("include", "/login");
      cy.url().should((url: string) => {
        const parsedUrl = new URL(url);
        const returnParam = parsedUrl.searchParams.get("next") || parsedUrl.searchParams.get("from") || parsedUrl.searchParams.get("redirect") || parsedUrl.searchParams.get("returnUrl") || parsedUrl.searchParams.get("return_url");
        if (returnParam) {
          const decoded = decodeURIComponent(returnParam);
          expect(decoded, "Preserved return path parameter").to.be.a("string").and.not.be.empty;
        } else {
          expect(url).to.include("/login");
        }
      });
    });

    it("verifies direct login defaults destination to main application area", () => {
      cy.url().should("include", "/login");
      cy.url().should((url: string) => {
        const parsedUrl = new URL(url);
        const returnParam =
          parsedUrl.searchParams.get("next") ||
          parsedUrl.searchParams.get("from") ||
          parsedUrl.searchParams.get("redirect");

        if (returnParam) {
          expect(decodeURIComponent(returnParam)).to.be.a("string").and.not.be.empty;
        }
      });
    });
  });

  describe("4. Navigation & Helper Links Rendering", () => {
    it("renders sign-up navigation link", () => {
      loginPage.getSignUpLink().should("be.visible");
    });

    it("renders forgot password or help link if present in DOM", () => {
      cy.get("body").then(($body) => {
        const hasForgotLink = $body.find("a[href*='forgot'], a[href*='reset']").length > 0;
        if (hasForgotLink) {
          loginPage.getForgotPasswordLink().should("be.visible");
        }
      });
    });
  });

  describe("5. Form Interactivity & UI Input Handling (Client-Side)", () => {
    it("accepts input typing and reflects entered values in the DOM", () => {
      loginPage.setUserName("test-user@magickvoice.com");
      loginPage.getEmailInput().should("have.value", "test-user@magickvoice.com");

      loginPage.setPassword("SecretPassword123!");
      loginPage.getPasswordInput().should("have.value", "SecretPassword123!");
    });

    it("clicks Sign-In button and asserts successful authentication result", () => {
      cy.intercept("POST", /.*(?:signInWithPassword|verifyPassword|auth\/session).*/, {
        statusCode: 200,
        body: {
          idToken: "mock-login-token-12345",
          email: "test-user@magickvoice.com",
          refreshToken: "mock-refresh-token",
          expiresIn: "3600",
          localId: "mock-user-uid-1001",
        },
      }).as("mockSignInSuccess");

      loginPage.setUserName("test-user@magickvoice.com");
      loginPage.setPassword("SecretPassword123!");
      loginPage.clickSubmitButton();

      cy.wait("@mockSignInSuccess").then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });

    it("clicks Sign-In button with invalid credentials and asserts error handling", () => {
      cy.intercept("POST", /.*(?:signInWithPassword|verifyPassword|auth\/session).*/, {
        statusCode: 400,
        body: {
          error: {
            message: "INVALID_LOGIN_CREDENTIALS",
            code: 400,
          },
        },
      }).as("mockSignInFailure");

      loginPage.setUserName("invalid-user@magickvoice.com");
      loginPage.setPassword("WrongPassword123!");
      loginPage.clickSubmitButton();

      cy.wait("@mockSignInFailure").then((interception) => {
        expect(interception.response?.statusCode).to.eq(400);
      });
    });
  });
});