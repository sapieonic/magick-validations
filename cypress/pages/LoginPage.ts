
class LoginPage {
  // Define selectors for login page elements
  path = "/login";
  txtusername = "input[type='email'], input[name='email'], input[placeholder*='email'], input[placeholder*='Email']";
  txtpassword = "input[type='password'], input[name='password']";
  txtloginsubmitbtn = "button[type='submit'], button";
  btngooglesignin = "button, a, [role='button']";
  imglogo = "img[alt*='logo'], img[alt*='MagickVoice'], svg, .logo";
  txterrormessage = ".error, .text-danger, [role='alert'], .toast-error";
  txtcontainer = "main, form, [class*='card'], [class*='container'], [class*='auth']";
  txtheading = "h1, h2, h3, .title, [class*='heading']";
  linksignup = "a[href*='signup'], a[href*='register'], [href*='sign-up'], a:contains('Sign up'), a:contains('Sign Up'), a:contains('Register'), a:contains('Create an account')";
  favicontag = "head link[rel*='icon']";

  // Navigation method
  visit(returnUrl?: string) {
    const url = returnUrl ? `${this.path}?from=${encodeURIComponent(returnUrl)}` : this.path;
    cy.visit(url);
    return this;
  }

  setUserName(username: string) {
    cy.get(this.txtusername).clear().type(username);
    return this;
  }

  setPassword(password: string) {
    cy.get(this.txtpassword).clear().type(password, { log: false });
    return this;
  }

  clickSubmitButton() {
    cy.get(this.txtloginsubmitbtn).contains(/sign in|log in|continue/i).click();
    return this;
  }

  clickGoogleSignInButton() {
    cy.contains(this.btngooglesignin, /continue with google|sign in with google|google/i).click();
    return this;
  }

  login(username: string, password: string) {
    this.setUserName(username);
    this.setPassword(password);
    this.clickSubmitButton();
    return this;
  }

  getLogo() {
    return cy.get(this.imglogo).first();
  }

  getGoogleSignInButton() {
    return cy.contains(this.btngooglesignin, /continue with google|sign in with google|google/i);
  }

  getEmailInput() {
    return cy.get(this.txtusername);
  }

  getPasswordInput() {
    return cy.get(this.txtpassword);
  }

  getSubmitButton() {
    return cy.get(this.txtloginsubmitbtn).contains(/sign in|log in|continue/i);
  }

  getContainer() {
    return cy.get(this.txtcontainer).first();
  }

  getHeading() {
    return cy.get(this.txtheading).first();
  }

  getSignUpLink() {
    return cy.get(this.linksignup).first();
  }

  getFavicon() {
    return cy.get(this.favicontag);
  }

  getErrorMessage() {
    return cy.get(this.txterrormessage);
  }

  clickSignUpLink() {
    this.getSignUpLink().click();
    return this;
  }

  verifyOnLoginPage() {
    cy.url().should("include", "/login");
    this.getGoogleSignInButton().should("be.visible");
    return this;
  }

  verifyTitle(expectedText: string = "MagickVoice") {
    cy.title().should("include", expectedText);
    return this;
  }

  verifyFavicon() {
    cy.get(this.favicontag).should("exist");
    return this;
  }

  verifyRedirectedTo(expectedPath: string) {
    cy.url().should("include", expectedPath);
    return this;
  }
}

export const loginPage = new LoginPage();
export default LoginPage;
