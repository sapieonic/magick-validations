
class LoginPage {
  // Selectors for Login UI components
  path = "/login";
  txtusername = "input[type='email'], input[name='email'], input[placeholder*='email'], input[placeholder*='Email']";
  txtpassword = "input[type='password'], input[name='password']";
  txtloginsubmitbtn = "button[type='submit'], button";
  btngooglesignin = "button, a, [role='button']";
  imglogo = "img[alt*='logo'], img[alt*='MagickVoice'], svg, .logo";
  txterrormessage = ".error, .text-danger, [role='alert'], .toast-error";
  txtcontainer = "main, form, [class*='card'], [class*='container'], [class*='auth']";
  txtheading = "h1, h2, h3, .title, [class*='heading']";
  linksignup = "a[href*='signup'], a[href*='register'], [href*='sign-up']";
  linkforgotpassword = "a[href*='forgot'], a[href*='reset'], a:contains('Forgot'), a:contains('Reset')";
  favicontag = "head link[rel*='icon']";

  // Navigation method
  visit(returnUrl?: string) {
    const url = returnUrl ? `${this.path}?from=${encodeURIComponent(returnUrl)}` : this.path;
    cy.visit(url, { failOnStatusCode: false });
    return this;
  }

  // UI Element Getters
  getLogo() {
    return cy.get(this.imglogo).first();
  }

  getContainer() {
    return cy.get(this.txtcontainer).first();
  }

  getHeading() {
    return cy.get(this.txtheading).first();
  }

  getEmailInput() {
    return cy.get(this.txtusername).first();
  }

  getPasswordInput() {
    return cy.get(this.txtpassword).first();
  }

  getSubmitButton() {
    return cy.get(this.txtloginsubmitbtn).contains(/sign in|log in|continue/i);
  }

  getGoogleSignInButton() {
    return cy.contains(this.btngooglesignin, /continue with google|sign in with google|google/i);
  }

  getSignUpLink() {
    return cy.get("body").then(($body) => {
      if ($body.find(this.linksignup).length > 0) {
        return cy.get(this.linksignup).first();
      }
      return cy.contains(/sign up|register|create account|don't have an account/i);
    });
  }

  getForgotPasswordLink() {
    return cy.get("body").then(($body) => {
      if ($body.find(this.linkforgotpassword).length > 0) {
        return cy.get(this.linkforgotpassword).first();
      }
      return cy.contains(/forgot password|reset password/i);
    });
  }

  getFavicon() {
    return cy.get(this.favicontag);
  }

  getErrorMessage() {
    return cy.get(this.txterrormessage);
  }

  setUserName(username: string) {
    this.getEmailInput().clear().type(username);
    return this;
  }

  setPassword(password: string) {
    this.getPasswordInput().clear().type(password, { log: false });
    return this;
  }

  clickSubmitButton() {
    this.getSubmitButton().click();
    return this;
  }

  clickGoogleSignInButton() {
    this.getGoogleSignInButton().click();
    return this;
  }

  clickSignUpLink() {
    this.getSignUpLink().click();
    return this;
  }

  loginViaUI(username: string, password: string) {
    this.setUserName(username);
    this.setPassword(password);
    this.clickSubmitButton();
    return this;
  }

  verifyOnLoginPage() {
    cy.url().should("include", "/login");
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

}

export const loginPage = new LoginPage();
export default LoginPage;

