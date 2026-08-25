# magick-validations

## MagickVoice — Authentication & UI Page Validation Suite

Cypress + TypeScript end-to-end and UI test suite for MagickVoice staging:

1. **Login Page Validations**: Validates UI elements, typography, logo, Google OAuth sign-in triggers, email/password form controls, and session redirection.
2. **Sign-Up Page Validations**: Validates sign-up input fields, client validation checks, and submission mocks.
3. **Session & Auth Interceptions**: Tests session authorization state, governance permissions, and route redirection.

---

## Getting Started

### 1. Local Installation
```bash
npm ci
cp .env.example .env   # fill in your local values (optional for mock mode)
```

### 2. Running the Tests
To open the Cypress Interactive Test Runner:
```bash
npm run cy:open
```

To run tests in headless mode:
```bash
npm run cy:run
```

Or run specific browser tests:
```bash
npm run test:auth:chrome
npm run test:auth:firefox
npm run test:auth:edge
```

---

## Project Structure
```text
magick-validations/
├── cypress/
│   ├── e2e/
│   │   └── auth/
│   │       ├── login.cy.ts     # Login UI & auth redirection tests
│   │       └── signup.cy.ts    # Sign-up page & form validation tests
│   ├── fixtures/
│   │   └── session.json        # Mock session & tenant governance data
│   ├── pages/
│   │   ├── LoginPage.ts        # Page Object Model for Login
│   │   └── SignUpPage.ts       # Page Object Model for Sign-Up
│   └── support/
│       ├── commands.ts         # Custom Cypress helper commands
│       └── e2e.ts              # Global test configuration and error handling
├── .env.example                # Environment variables template
├── cypress.config.ts           # Cypress configuration
└── package.json
```
