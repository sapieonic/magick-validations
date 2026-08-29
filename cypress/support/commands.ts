declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      interceptAuthSession(fixtureOrData?: Record<string, unknown> | string): Chainable<null>;
      interceptFirebaseConfig(): Chainable<null>;
      mockAuthenticatedSession(): Chainable<null>;
      loginViaUI(email?: string, password?: string): Chainable<null>;
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

Cypress.Commands.add("loginViaUI", (email?: string, password?: string) => {
  const userEmail = email || Cypress.env("MV_TEST_EMAIL");
  const userPassword = password || Cypress.env("MV_TEST_PASSWORD");

  if (!userEmail || !userPassword) {
    cy.log("No credentials in environment variables -> applying mock session");
    cy.mockAuthenticatedSession();
    return;
  }

  cy.session(
    `auth-session-${userEmail}`,
    () => {
      cy.intercept("POST", "**/auth/session").as("sessionLoginPost");

      cy.visit("/login?from=%2Fapp%2Fcalls", { failOnStatusCode: false });
      
      cy.get("body", { timeout: 15000 }).then(($body) => {
        const signInTab = $body.find("button, [role='tab'], a").filter((_, el) => /^sign in$/i.test((el.innerText || "").trim()));
        if (signInTab.length > 0) {
          cy.wrap(signInTab.first()).click({ force: true });
        }
      });

      cy.get("input[type='email'], input[name='email'], input[placeholder*='email']", { timeout: 15000 })
        .should("be.visible")
        .clear({ force: true })
        .type(userEmail, { force: true });

      cy.get("input[type='password'], input[name='password']", { timeout: 15000 })
        .should("be.visible")
        .clear({ force: true })
        .type(userPassword, { log: false, force: true });

      cy.get("form button[type='submit'], form button, button[type='submit']")
        .filter((_, el) => !el.innerText.toLowerCase().includes("google"))
        .last()
        .click({ force: true });

      // Wait for session authentication or redirect
      cy.url({ timeout: 25000 }).should("include", "/app");
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.getAllCookies().should("not.be.empty");
      },
    }
  );
});

Cypress.Commands.add("mockAuthenticatedSession", () => {
  cy.interceptFirebaseConfig();
  cy.interceptAuthSession();

  // Intercept backend calls for authenticated pages
  cy.intercept("GET", "**/api/v1/calls*", {
    statusCode: 200,
    body: { calls: [], total: 0, page: 1, limit: 20 },
  }).as("getCalls");

  cy.intercept("GET", "**/api/v1/campaigns*", {
    statusCode: 200,
    body: { campaigns: [] },
  }).as("getCampaigns");

  cy.intercept("GET", "**/api/v1/agents*", {
    statusCode: 200,
    body: { agents: [] },
  }).as("getAgents");

  // Populate IndexedDB with Firebase Auth session token
  cy.visit("/login", { failOnStatusCode: false });
  cy.window().then((win) => {
    return new Cypress.Promise((resolve, reject) => {
      const req = win.indexedDB.open("firebaseLocalStorageDb", 1);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
          db.createObjectStore("firebaseLocalStorage", { keyPath: "fbase_key" });
        }
      };
      req.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
          resolve(true);
          return;
        }
        const tx = db.transaction("firebaseLocalStorage", "readwrite");
        const store = tx.objectStore("firebaseLocalStorage");

        const testEmail = Cypress.env("MV_TEST_EMAIL") || "test-user@magickvoice.com";
        const fakeUser = {
          fbase_key: "firebase:authUser:dummy-key:[DEFAULT]",
          value: {
            uid: "mock-firebase-uid-1001",
            email: testEmail,
            emailVerified: true,
            displayName: testEmail.split("@")[0],
            isAnonymous: false,
            photoURL: "https://avatar.vercel.sh/test-user",
            providerData: [
              {
                providerId: "password",
                uid: testEmail,
                displayName: testEmail.split("@")[0],
                email: testEmail,
                phoneNumber: "+15551234567",
                photoURL: null,
              },
            ],
            stsTokenManager: {
              refreshToken: "mock-refresh-token",
              accessToken: "mock-access-token",
              expirationTime: Date.now() + 3600 * 1000 * 24,
            },
            createdAt: "1724437460000",
            lastLoginAt: "1724437460000",
            appName: "[DEFAULT]",
          },
        };

        store.put(fakeUser);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  });
});

export {};
