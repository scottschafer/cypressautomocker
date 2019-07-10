// in your app, you would use this:
//
// import registerAutoMockCommands from 'cypressautomocker/include-in-tests';
// registerAutoMockCommands();
//
// for this sample, we need to use relative paths:
import * as registerAutoMockCommands from '../../../include-in-tests/autoMockCommands';

registerAutoMockCommands();

// Remove fetch from the global window object, so we automatically trigger
// the XHR fallback. Should be the same as the jQuery implementation?
beforeEach(function() {
  cy.on('window:before:load', win => {
    win.fetch = null;
  });
});

interface IMockEntry {
  method: string,
  path: string,
  query: string,
  request: string,
  response: string;
  status: number;
  statusText: string;
  contentType: string;
}

type automock = (filename: string, options?: {
  resolveMockFunc?: (
    request: { url: string, method: string },
    mockArray: Array<IMockEntry>,
    mock: IMockEntry) => IMockEntry
}) => void;
type automockEnd = () => void;
type automockWaitOnPendingAPIs = () => void;

declare global {
  namespace Cypress {
    interface Chainable {
      automock: automock;
      automockEnd: automockEnd;
      automockWaitOnPendingAPIs: automockWaitOnPendingAPIs;
    }
  }
}
