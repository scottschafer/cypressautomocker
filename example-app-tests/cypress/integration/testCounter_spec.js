describe('test', function () {

  const MOCK_FILENAME = 'testCounter';

  before(() => {
    cy.automock(MOCK_FILENAME, __dirname);
  });

  beforeEach(() => {
  });

  after(() => {
    cy.automockEnd();
  });

  afterEach(() => {
    cy.waitOnPendingAPIs();
  });

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

  it('basic counter works as expected, run #2', function () {

    cy.get('[data-test=button-increment2-delay]').click();
    cy.get('[data-test=button-increment2-delay]').click();
    cy.get('[data-test=button-refresh]').click();
    cy.get('[data-test=counter-label]').contains('3');

    cy.get('[data-test=button-increment]').click();
    cy.get('[data-test=button-refresh]').click();
    cy.get('[data-test=counter-label]').contains('4');

    cy.wait(1500);

    cy.get('[data-test=button-refresh]').click();
    cy.get('[data-test=counter-label]').contains('8');
  });

})
