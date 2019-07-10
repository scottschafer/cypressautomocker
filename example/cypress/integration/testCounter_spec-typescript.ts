/**
 * Reject a tentative opportunity. Verify that rendering provider is changed to N/A
 */

/// <reference types="cypress" />
import '../support/commands'; // seems to help VS Code's IntelliSense

describe('test - typescript', function () {

  const MOCK_FILENAME = 'testCounter';

  before(() => {
    
    cy.automock(MOCK_FILENAME, {
      resolveMockFunc: (request, mockArray, mock) => {
        console.log(request.method + ' ' + request.url);
        // just return the resolved mock. This is a no-op. We could resolve to a different one in mockArray
        return mock;
      }
    });
    // note: the above is equivalent to cy.automock(MOCK_FILENAME);

  });

  after(() => {
    cy.automockEnd();
  });

  // first run, start by resetting the counter
  it('basic counter works as expected', function () {

    cy.visit('/')
    
    // reset the counter
    cy.get('[data-test=button-reset]').click();

    // increment the counter
    cy.get('[data-test=button-increment]').click();

    // increment the counter with a query string
    cy.get('[data-test=button-increment2]').click();

    // refresh the display
    cy.get('[data-test=button-refresh]').click();

    cy.get('[data-test=counter-label]').contains('3');
  });

  // second run, don't reset the counter so that API will proceed from previous value
  it('basic counter works as expected, run #2', function () {

    // click on buttons that increment the counter after a second (simulating a slower API)
    cy.get('[data-test=button-increment2-delay]').click();
    cy.get('[data-test=button-increment2-delay]').click();

    // refresh, verify that counter hasn't changed
    cy.get('[data-test=button-refresh]').click();
    cy.get('[data-test=counter-label]').contains('3');

    // now click a button that does an immediate increment, refresh and verify counter
    cy.get('[data-test=button-increment]').click();
    cy.get('[data-test=button-refresh]').click();
    cy.get('[data-test=counter-label]').contains('4');

    // wait for the "slower" APIs to finish
    cy.automockWaitOnPendingAPIs();

    // refresh and verify value
    cy.get('[data-test=button-refresh]').click();
    cy.get('[data-test=counter-label]').contains('8');
  });

  it('fetch and get are equivalent', function () {
    cy.get('[data-test=button-test-get]').click();
    cy.get('[data-test=button-test-fetch]').click();
    cy.get('[data-test=sw1]').contains('https://swapi.co/api');
    cy.get('[data-test=sw2]').contains('https://swapi.co/api');
  });

  it('handles API errors', function () {
    cy.get('[data-test=button-test-post-with-error]').click();
    cy.get('[data-test=result-text]').contains('402');
  });

})
