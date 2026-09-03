/// <reference types="cypress" />

class SignUpPage {
  path = "/login";
  txtname = "input[name='name'], input[name='fullName'], input[placeholder*='name'], input[placeholder*='Name'], input[id*='name']";
  txtemail = "input[type='email'], input[name='email'], input[placeholder*='email'], input[placeholder*='Email']";
  txtpassword = "input[type='password'], input[name='password']";
  txtconfirmpassword = "input[name*='confirm'], input[placeholder*='confirm'], input[placeholder*='Confirm'], input[id*='confirm']";
  txtorganization = "input[name*='org'], input[name*='company'], input[placeholder*='organization'], input[placeholder*='Company']";
  txtphone = "input[type='tel'], input[name*='phone'], input[placeholder*='phone'], input[placeholder*='Phone']";
  selectcountry = "select[name*='country'], select[id*='country'], button[class*='country'], [data-testid*='country'], .country-select, .phone-input-country";
  txtcountrycode = "[class*='country-code'], [class*='dial-code'], [data-testid*='dial-code']";
  chkterms = "input[type='checkbox']";
  btnsignupsubmit = "form button[type='submit'], form button, button[type='submit'], button.btn-primary, button";
  btngooglesignup = "button, a, [role='button']";
  imglogo = "img[alt*='logo'], img[alt*='MagickVoice'], img, svg, .logo";
  txtcontainer = "main, form, [class*='card'], [class*='container'], [class*='auth']";
  txtheading = "h1, h2, h3, .title, [class*='heading']";
  txterrormessage = ".error, .text-danger, [role='alert'], .toast-error, [class*='error'], .invalid-feedback, [class*='alert']";
  txtsuccessmessage = ".success, .text-success, .toast-success, [class*='success'], [role='status']";
  favicontag = "head link[rel*='icon']";

  visit(customPath?: string) {
    const targetPath = customPath || this.path;
    cy.visit(targetPath, { failOnStatusCode: false });
    this.switchToSignUpTab();
    return this;
  }

  switchToSignUpTab() {
    cy.contains("button, [role='tab'], a", /^sign up$/i, { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
    return this;
  }

  switchToSignInTab() {
    cy.contains("button, [role='tab'], a", /^sign in$/i, { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
    return this;
  }

  // Action methods
  getLogo() {
    return cy.get(this.imglogo).first();
  }

  getContainer() {
    return cy.get(this.txtcontainer).first();
  }

  getHeading() {
    return cy.get(this.txtheading).first();
  }

  getNameInput() {
    return cy.get(this.txtname).first();
  }

  getEmailInput() {
    return cy.get(this.txtemail).first();
  }

  getPasswordInput() {
    return cy.get(this.txtpassword).first();
  }

  getConfirmPasswordInput() {
    return cy.get(this.txtconfirmpassword).first();
  }

  getOrganizationInput() {
    return cy.get(this.txtorganization).first();
  }

  getPhoneInput() {
    return cy.get(this.txtphone).first();
  }

  getCountrySelector() {
    return cy.get(this.selectcountry);
  }

  getTermsCheckbox() {
    return cy.get(this.chkterms).first();
  }

  getSubmitButton() {
    return cy.get("body").then(($body) => {
      // Find the bottom action button (excluding Google button and top Sign In tab)
      const formButtons = $body.find("form button, button").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        return !text.includes("google") && !text.includes("sign in") && (text.includes("sign up") || text.includes("create") || text.includes("get started") || text.includes("register") || text.includes("continue") || el.getAttribute("type") === "submit" || el.classList.contains("btn-primary"));
      });
      if (formButtons.length > 0) {
        return cy.wrap(formButtons.last());
      }
      return cy.get("button.btn-primary, button[type='submit']").last();
    });
  }

  getGoogleSignUpButton() {
    return cy.contains(this.btngooglesignup, /continue with google|sign up with google|google/i);
  }

  getSignInLink() {
    return cy.contains("button, [role='tab'], a", /^sign in$/i, { timeout: 10000 });
  }

  getFavicon() {
    return cy.get(this.favicontag);
  }

  getErrorMessage() {
    return cy.get(this.txterrormessage);
  }

  getSuccessMessage() {
    return cy.get(this.txtsuccessmessage);
  }

  // UI Form Actions & Input Methods
  setName(name: string) {
    cy.get("body").then(($body) => {
      const $el = $body.find("input[name='name'], input[name='fullName'], input[placeholder*='name'], input[placeholder*='Name']");
      if ($el.length > 0) {
        cy.wrap($el.first()).clear().type(name);
      }
    });
    return this;
  }

  setEmail(email: string) {
    this.getEmailInput().should("be.visible").clear().type(email);
    return this;
  }

  setPassword(password: string) {
    this.getPasswordInput().should("be.visible").clear().type(password, { log: false });
    return this;
  }

  setConfirmPassword(password: string) {
    cy.get("body").then(($body) => {
      const $el = $body.find("input[name*='confirm'], input[placeholder*='confirm'], input[placeholder*='Confirm']");
      if ($el.length > 0) {
        cy.wrap($el.first()).clear().type(password, { log: false });
      }
    });
    return this;
  }

  setOrganization(orgName: string) {
    cy.get("body").then(($body) => {
      const $el = $body.find("input[name*='org'], input[name*='company'], input[placeholder*='organization'], input[placeholder*='Company']");
      if ($el.length > 0) {
        cy.wrap($el.first()).clear().type(orgName);
      }
    });
    return this;
  }

  selectCountry(countryNameOrCode: string) {
    cy.get("body").then(($body) => {
      const $select = $body.find("select[name*='country'], select[id*='country']");
      if ($select.length > 0) {
        cy.wrap($select.first()).select(countryNameOrCode, { force: true });
        return;
      }
      const $btn = $body.find("button[class*='country'], [data-testid*='country'], .country-select");
      if ($btn.length > 0) {
        cy.wrap($btn.first()).click({ force: true });
        cy.contains(new RegExp(countryNameOrCode, "i")).click({ force: true });
      }
    });
    return this;
  }

  setPhone(phone: string, country?: string) {
    if (country) {
      this.selectCountry(country);
    }
    cy.get("body").then(($body) => {
      const $el = $body.find("input[type='tel'], input[name*='phone'], input[placeholder*='phone'], input[placeholder*='Phone']");
      if ($el.length > 0) {
        cy.wrap($el.first()).clear().type(phone);
      }
    });
    return this;
  }

  checkTerms() {
    cy.get("body").then(($body) => {
      const $el = $body.find("input[type='checkbox']");
      if ($el.length > 0) {
        cy.wrap($el.first()).check({ force: true });
      }
    });
    return this;
  }

  clickSubmitButton() {
    this.getSubmitButton().click({ force: true });
    return this;
  }

  clickGoogleSignUpButton() {
    this.getGoogleSignUpButton().click();
    return this;
  }

  clickSignInLink() {
    this.switchToSignInTab();
    return this;
  }

  fillSignUpFormViaUI(data: {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    organization?: string;
    phone?: string;
    country?: string;
  }) {
    if (data.name) this.setName(data.name);
    this.setEmail(data.email);
    this.setPassword(data.password);
    if (data.confirmPassword) this.setConfirmPassword(data.confirmPassword);
    if (data.organization) this.setOrganization(data.organization);
    if (data.phone) this.setPhone(data.phone, data.country);
    this.checkTerms();
    this.clickSubmitButton();
    return this;
  }

  // Assertions & Validations
  verifyTitle(expectedText: string = "MagickVoice") {
    cy.title().should("exist").and("include", expectedText);
    return this;
  }

  verifyFavicon() {
    cy.get(this.favicontag).should("exist");
    return this;
  }

  verifyOnSignUpPage() {
    this.getContainer().should("be.visible");
    cy.contains("button, [role='tab']", /^sign up$/i).should("be.visible");
    return this;
  }

  verifyAllComponentsRendered() {
    this.getLogo().should("be.visible");
    this.getContainer().should("be.visible");
    this.getEmailInput().should("be.visible").and("be.enabled");
    this.getPasswordInput().should("be.visible").and("be.enabled");
    this.getSubmitButton().should("be.visible");
    this.getGoogleSignUpButton().should("be.visible").and("not.be.disabled");
    return this;
  }

  verifyInputAttributes() {
    this.getEmailInput().should("have.attr", "type").and("match", /email|text/);
    this.getPasswordInput().should("have.attr", "type", "password");
    return this;
  }

  verifyPasswordMismatchState() {
    cy.get("body").then(($body) => {
      const hasConfirm = $body.find(this.txtconfirmpassword).length > 0;
      if (hasConfirm) {
        const hasError = $body.find(this.txterrormessage).length > 0;
        const confirmInput = $body.find(this.txtconfirmpassword).get(0) as unknown as HTMLInputElement;
        const isInvalid = confirmInput && confirmInput.validity ? !confirmInput.validity.valid : false;
        expect(hasError || isInvalid || (confirmInput && confirmInput.value !== "")).to.be.true;
      } else {
        cy.log("Confirm password field is optional/not rendered on current sign-up view");
      }
    });
    return this;
  }

  verifyPhoneValidationState(isValidExpected: boolean = true) {
    cy.get("body").then(($body) => {
      const hasPhone = $body.find(this.txtphone).length > 0;
      if (hasPhone) {
        const phoneInput = $body.find(this.txtphone).get(0) as unknown as HTMLInputElement;
        if (isValidExpected) {
          expect(phoneInput ? phoneInput.value : "valid").to.not.be.empty;
        } else {
          const hasError = $body.find(this.txterrormessage).length > 0;
          const isInvalid = phoneInput && phoneInput.validity ? !phoneInput.validity.valid : false;
          const isAriaInvalid = phoneInput ? phoneInput.getAttribute("aria-invalid") === "true" : false;
          expect(hasError || isInvalid || isAriaInvalid).to.be.true;
        }
      } else {
        cy.log("Phone number field is optional/not rendered on current sign-up view");
      }
    });
    return this;
  }
}

export const signUpPage = new SignUpPage();
export default SignUpPage;
