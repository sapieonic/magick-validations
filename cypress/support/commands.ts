declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      loginViaFirebase(email?: string, password?: string): Chainable<string>;
      interceptAuthSession(fixtureOrData?: Record<string, unknown> | string): Chainable<null>;
      interceptFirebaseConfig(): Chainable<null>;
    }
  }
}

Cypress.Commands.add("loginViaFirebase", (email?: string, password?: string) => {
  const apiKey = Cypress.env("FIREBASE_API_KEY");
  const userEmail = email || (Cypress.env("MV_TEST_EMAIL") as string);
  const userPassword = password || (Cypress.env("MV_TEST_PASSWORD") as string);

  if (!apiKey || !userEmail || !userPassword) {
    cy.log("Live credentials not set — using local mock authentication token.");
    return cy.wrap("mock-firebase-token-local-dev");
  }

  return cy
    .request({
      method: "POST",
      url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      body: {
        email: userEmail,
        password: userPassword,
        returnSecureToken: true,
      },
      failOnStatusCode: true,
    })
    .then((res) => {
      expect(res.status, "Firebase sign-in status").to.eq(200);
      const idToken = res.body.idToken as string;
      expect(idToken, "Firebase idToken").to.be.a("string").and.not.be.empty;
      return idToken;
    });
});

Cypress.Commands.add(
  "interceptAuthSession",
  (fixtureOrData: Record<string, unknown> | string = "session.json") => {
    if (typeof fixtureOrData === "string") {
      cy.intercept("POST", "**/auth/session", { fixture: fixtureOrData }).as("authSession");
    } else {
      cy.intercept("POST", "**/auth/session", { body: fixtureOrData }).as("authSession");
    }
  }
);

Cypress.Commands.add("interceptFirebaseConfig", () => {
  cy.intercept(
    "GET",
    "**/identitytoolkit/v3/relyingparty/getProjectConfig*",
    (req) => {
      req.continue();
    }
  ).as("getProjectConfig");
});

export {};
