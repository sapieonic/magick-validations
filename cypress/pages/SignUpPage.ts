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
  linksignin = "a[href*='login'], a[href*='signin'], a:contains('Sign in'), a:contains('Log in'), a:contains('Already have an account')";
  imglogo = "img[alt*='logo'], img[alt*='MagickVoice'], svg, .logo";
  txtcontainer = "main, form, [class*='card'], [class*='container'], [class*='auth']";
  txterrormessage = ".error, .text-danger, [role='alert'], .toast-error, [class*='error']";
  favicontag = "head link[rel*='icon']";

  // Navigation method
  visit() {
    cy.visit(this.path, { failOnStatusCode: false });
    return this;
  }

  // Action methods
  setName(name: string) {
    cy.get("body").then(($body) => {
      if ($body.find(this.txtname).length > 0) {
        cy.get(this.txtname).first().clear().type(name);
      }
    });
    return this;
  }

  setEmail(email: string) {
    cy.get(this.txtemail).first().clear().type(email);
    return this;
  }

  setPassword(password: string) {
    cy.get(this.txtpassword).first().clear().type(password, { log: false });
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
    cy.get(this.btnsignupsubmit).contains(/sign up|register|create account|continue|get started/i).click({ force: true });
    return this;
  }

  clickGoogleSignUpButton() {
    cy.contains(this.btngooglesignup, /continue with google|sign up with google|google/i).click();
    return this;
  }

  clickSignInLink() {
    cy.contains(this.linksignin, /sign in|log in|already have an account/i).click();
    return this;
  }

  fillSignUpForm(data: {
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

  // Element getter methods (for assertions)
  getLogo() {
    return cy.get(this.imglogo).first();
  }

  getContainer() {
    return cy.get(this.txtcontainer).first();
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

  getSubmitButton() {
    return cy.get(this.btnsignupsubmit).contains(/sign up|register|create account|continue|get started/i);
  }

  getGoogleSignUpButton() {
    return cy.contains(this.btngooglesignup, /continue with google|sign up with google|google/i);
  }

  getSignInLink() {
    return cy.contains(this.linksignin, /sign in|log in|already have an account/i);
  }

  getFavicon() {
    return cy.get(this.favicontag);
  }

  getErrorMessage() {
    return cy.get(this.txterrormessage);
  }

  verifyTitle(expectedText: string = "MagickVoice") {
    cy.title().should("include", expectedText);
    return this;
  }

  verifyFavicon() {
    cy.get(this.favicontag).should("exist");
    return this;
  }

  verifyOnSignUpPage() {
    cy.url().should("satisfy", (url: string) => {
      return url.includes("/signup") || url.includes("/register") || url.includes("/login");
    });
    return this;
  }
}

export const signUpPage = new SignUpPage();
export default SignUpPage;
