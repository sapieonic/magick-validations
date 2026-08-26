declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      interceptAuthSession(fixtureOrData?: Record<string, unknown> | string): Chainable<null>;
      interceptFirebaseConfig(): Chainable<null>;
    }
  }
}

Cypress.Commands.add(
  "interceptAuthSession",
  (fixtureOrData: Record<string, unknown> | string = "session.json") => {
    const testEmail = Cypress.env("MV_TEST_EMAIL") || "test-user@magickvoice.com";
    if (typeof fixtureOrData === "string") {
      cy.fixture(fixtureOrData).then((session) => {
        const dynamicSession = {
          ...session,
          user: {
            ...session.user,
            email: testEmail,
            display_name: testEmail.split("@")[0],
          },
        };
        cy.intercept("POST", "**/auth/session", { statusCode: 200, body: dynamicSession }).as("authSession");
      });
    } else {
      cy.intercept("POST", "**/auth/session", { statusCode: 200, body: fixtureOrData }).as("authSession");
    }
  }
);

Cypress.Commands.add("interceptFirebaseConfig", () => {
  cy.intercept(
    "GET",
    "**/identitytoolkit/v3/relyingparty/getProjectConfig*",
    { statusCode: 200, body: {} }
  ).as("getProjectConfig");
});

export {};
