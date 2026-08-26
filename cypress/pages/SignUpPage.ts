/// <reference types="cypress" />

class SignUpPage {
  // Define selectors for signup page elements
  path = "/signup";
  txtname = "input[name='name'], input[name='fullName'], input[placeholder*='name'], input[placeholder*='Name'], input[id*='name']";
  txtemail = "input[type='email'], input[name='email'], input[placeholder*='email'], input[placeholder*='Email']";
  txtpassword = "input[type='password'], input[name='password']";
  txtconfirmpassword = "input[name*='confirm'], input[placeholder*='confirm'], input[placeholder*='Confirm']";
  txtorganization = "input[name*='org'], input[name*='company'], input[placeholder*='organization'], input[placeholder*='Company']";
  txtphone = "input[type='tel'], input[name*='phone'], input[placeholder*='phone'], input[placeholder*='Phone']";
  chkterms = "input[type='checkbox']";
  btnsignupsubmit = "button[type='submit'], button";
  btngooglesignup = "button, a, [role='button']";
  linksignin = "a[href*='login'], a[href*='signin'], [href*='login'], [href*='signin']";
  imglogo = "img[alt*='logo'], img[alt*='MagickVoice'], img, svg, .logo";
  txtcontainer = "main, form, [class*='card'], [class*='container'], [class*='auth']";
  txtheading = "h1, h2, h3, .title, [class*='heading']";
  txterrormessage = ".error, .text-danger, [role='alert'], .toast-error, [class*='error']";
  favicontag = "head link[rel*='icon']";

  // Navigation & Tab Switching
  visit() {
    cy.visit("/login", { failOnStatusCode: false });
    this.switchToSignUpTab();
    return this;
  }

  switchToSignUpTab() {
    cy.get("body").then(($body) => {
      const tab = $body.find("button, [role='tab'], a").filter((_, el) => /sign up|create account|register/i.test(el.innerText || el.textContent || ""));
      if (tab.length > 0) {
        cy.wrap(tab.first()).click({ force: true });
      }
    });
    return this;
  }

  switchToSignInTab() {
    cy.get("body").then(($body) => {
      const tab = $body.find("button, [role='tab'], a").filter((_, el) => /sign in|log in|already have an account/i.test(el.innerText || el.textContent || ""));
      if (tab.length > 0) {
        cy.wrap(tab.first()).click({ force: true });
      }
    });
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

  getTermsCheckbox() {
    return cy.get(this.chkterms).first();
  }

  getSubmitButton() {
    return cy.get(this.btnsignupsubmit).contains(/sign up|register|create account|continue|get started/i);
  }

  getGoogleSignUpButton() {
    return cy.contains(this.btngooglesignup, /continue with google|sign up with google|google/i);
  }

  getSignInLink() {
    return cy.get("body").then(($body) => {
      const link = $body.find("a[href*='login'], a[href*='signin'], [href*='login'], [href*='signin']");
      if (link.length > 0) {
        return cy.wrap(link.first());
      }
      return cy.contains(/sign in|log in|already have an account|have an account/i);
    });
  }

  getFavicon() {
    return cy.get(this.favicontag);
  }

  getErrorMessage() {
    return cy.get(this.txterrormessage);
  }

  // UI Automation & Action Methods (pure UI clicks and typing)
  setName(name: string) {
    cy.get("body").then(($body) => {
      if ($body.find(this.txtname).length > 0) {
        cy.get(this.txtname).first().clear().type(name);
      }
    });
    return this;
  }

  setEmail(email: string) {
    this.getEmailInput().clear().type(email);
    return this;
  }

  setPassword(password: string) {
    this.getPasswordInput().clear().type(password, { log: false });
    return this;
  }

  setConfirmPassword(password: string) {
    cy.get("body").then(($body) => {
      if ($body.find(this.txtconfirmpassword).length > 0) {
        cy.get(this.txtconfirmpassword).first().clear().type(password, { log: false });
      }
    });
    return this;
  }

  setOrganization(orgName: string) {
    cy.get("body").then(($body) => {
      if ($body.find(this.txtorganization).length > 0) {
        cy.get(this.txtorganization).first().clear().type(orgName);
      }
    });
    return this;
  }

  setPhone(phone: string) {
    cy.get("body").then(($body) => {
      if ($body.find(this.txtphone).length > 0) {
        cy.get(this.txtphone).first().clear().type(phone);
      }
    });
    return this;
  }

  checkTerms() {
    cy.get("body").then(($body) => {
      if ($body.find(this.chkterms).length > 0) {
        cy.get(this.chkterms).first().check({ force: true });
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
    this.getSignInLink().click();
    return this;
  }

  fillSignUpFormViaUI(data: {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    organization?: string;
    phone?: string;
  }) {
    if (data.name) this.setName(data.name);
    this.setEmail(data.email);
    this.setPassword(data.password);
    if (data.confirmPassword) this.setConfirmPassword(data.confirmPassword);
    if (data.organization) this.setOrganization(data.organization);
    if (data.phone) this.setPhone(data.phone);
    this.checkTerms();
    this.clickSubmitButton();
    return this;
  }

  verifyTitle(expectedText: string = "MagickVoice") {
    cy.title().should("exist").and("not.be.empty");
    return this;
  }

  verifyFavicon() {
    cy.get(this.favicontag).should("exist");
    return this;
  }

  verifyOnSignUpPage() {
    this.getContainer().should("be.visible");
    cy.contains(/sign up|create account|register|get started/i).should("be.visible");
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
}

export const signUpPage = new SignUpPage();
export default SignUpPage;

