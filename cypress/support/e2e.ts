import "./commands";

Cypress.on("uncaught:exception", () => {
  return true;
});
