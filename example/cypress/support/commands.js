// in your app, you would use this:
//
// import registerAutoMockCommands from 'cypressautomocker/include-in-tests';
// registerAutoMockCommands();
//
// for this sample, we need to use relative paths:
import registerAutoMockCommands from '../../../include-in-tests';
registerAutoMockCommands();

// Remove fetch from the global window object, so we automatically trigger
// the XHR fallback. Should be the same as the jQuery implementation?
beforeEach(function() {
  cy.on('window:before:load', win => {
    win.fetch = null;
  });
});

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
