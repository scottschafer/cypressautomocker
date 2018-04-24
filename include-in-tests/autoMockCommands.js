/**
 * cy.testRequests(cb)
 *  Calls cb() with the entire array of requests made from the frontend to the mock server.
 *
 *  * cy.testRequests(filter, cb)
 *  Calls cb() with the array of requests where the URL contains filter.

 */

module.exports = registerAutoMockCommands;

function registerAutoMockCommands() {
  
  // for recording or mocking:
  let currentMockFileName = null;
  let currentOptions = null;

  // for recording
  let recordedApis = [];

  // for mocking
  let apiKeyToMocks = {};
  let apiKeyToCallCounts = {};

  let completedPendingRequestsFunc = null;
  var pendingApiCount = 0;
  let automocker = null;

  Cypress.Commands.add('automock', (sessionName, options) => {

    const testDirPath = '/cypress/integration';
    options = setOptions(options);

    // determine the mock file name
    if (sessionName.indexOf('.json') == -1) {
      sessionName += '.json';
    }

    currentMockFileName = testDirPath + '/../../automocks/' + sessionName;

    // get the absolute path for recording purposes
    cy.exec('pwd').then(result => {
      const absolutePathToMockFile = result.stdout + '/automocks/' + sessionName;

      // if the config allows us to replay the mock, test if it exists
      if (Cypress.config().automockPlayback) {

        cy.exec('ls ' + absolutePathToMockFile, {
          failOnNonZeroExit: false
        }).then(result => {
          if (result.code === 0) {
            // file exists, so mock APIs
            cy.readFile(currentMockFileName).then((contents) => {
              startApiMocking(contents);
            });
          } else {
            // file doesn't exist, so start recording if allowed
            if (!currentOptions.isCustomMock && Cypress.config().automockRecord) {
              startApiRecording();
            }
          }
        });
      } else if (!currentOptions.isCustomMock && Cypress.config().automockRecord) {
        startApiRecording();
      }
    });
  });


  Cypress.Commands.add('automockEnd', () => {

    if (automocker.isRecording) {
      cy.waitOnPendingAPIs().then(() => {
        automocker.isRecording = false;
      })
      cy.writeMockServer();
    }
    automocker.isMocking = false;
  });

  Cypress.Commands.add('inspectRequests', (param1, param2) => {
    if (!automocker.isRecording) {
      return; // no-op for now when using live server
    }

    let mockedRequests = testServerAPI.mockedRequests();
    let testFunction;

    if (typeof param1 === 'function') {
      testFunction = param1;
    } else {
      testFunction = param2;
      mockedRequests = mockedRequests.filter((val) => {
        return val.apiKey.indexOf(param1) !== -1;
      });
    }
    testFunction(mockedRequests);
  })

  Cypress.Commands.add('waitOnPendingAPIs', () => {
    return new Cypress.Promise((resolve, reject) => {
      if (pendingApiCount) {
        console.log('waiting on APIs to complete');
        completedPendingRequestsFunc = function () {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });

  Cypress.Commands.add('writeMockServer', () => {
    if (currentMockFileName !== null && recordedApis) {
      cy.writeFile(currentMockFileName, recordedApis);
      currentMockFileName = null;
    } else {
      currentMockFileName = null;
    }
  });


  automocker = window.Cypress.autoMocker = {
    isRecording: false,
    isMocking: false,
    mockResponse: (request) => {
      if (automocker.isMocking) {
        const key = getApiKey(request);
        if (apiKeyToMocks.hasOwnProperty(key)) {
          const apiCount = apiKeyToCallCounts[key]++;
          if (apiCount < apiKeyToMocks[key].length) {
            const mock = apiKeyToMocks[key][apiCount];
            let response = mock.response;

            if (typeof response === 'object') {
              // should this be done in all cases? TBD
              response = JSON.stringify(response);
            }

            if (mock) {
              console.log('MOCKING ' + request.url);
              return {
                status: mock.status,
                statusText: mock.statusText,
                response: JSON.stringify(mock.response)
              };
            }
          }
        }
      } else if (automocker.isRecording) {

        function prepareOnLoadHandler(xhr) {
          (function () {
            const old_onload = xhr.onload;
            const url = xhr.url;
            const method = xhr.method;

            xhr.onload = () => {
              if (old_onload) {
                old_onload();
              }
              let parsed = parseUri(url);
              let query = '';

              console.log('RECORD: ' + url);
              // clone
              let requestObject = xhr.request ? JSON.parse(JSON.stringify(xhr.request)) : '';
              let responseObject = xhr.response ? JSON.parse(JSON.stringify(xhr.response)) : '';
              let contentType = xhr.getResponseHeader('content-type');
              if (contentType.toLowerCase().indexOf('application/json') !== -1) {
                try {
                  responseObject = JSON.parse(responseObject);
                } catch(e) {}
              }
              let transformedObject = {
                'method': method,
                'path': parsed.path,
                'query': parsed.query,
                'request': requestObject,
                'response': responseObject,
                'status': xhr.status,
                'statusText': xhr.statusText,
                'contentType': contentType
              };

              if (currentOptions.recordFilter(transformedObject)) {
                recordedApis.push(transformedObject);
              }
            }
          })();
        }
        prepareOnLoadHandler(request);
      }
      if (automocker.isMocking) {
        console.log('MOCKING ON, but letting this fall through: ' + request.url);
      }
      ++pendingApiCount;
      return false;
    },

    onloadstart: (event) => {},

    onloadend: (event) => {
      --pendingApiCount;
      if (!pendingApiCount && completedPendingRequestsFunc) {
        completedPendingRequestsFunc();
        completedPendingRequestsFunc = null;
      }
    }
  }

  function startApiRecording() {
    automocker.isRecording = true;
    recordedApis = [];
  }

  function startApiMocking(mocks) {
    automocker.isMocking = true;
    apiKeyToMocks = {};
    apiKeyToCallCounts = {};

    mocks.forEach(function (mock) {
      const key = getApiKey(mock);
      if (!apiKeyToMocks.hasOwnProperty(key)) {
        apiKeyToMocks[key] = [];
        apiKeyToCallCounts[key] = 0;
      }
      apiKeyToMocks[key].push(mock);
    });

    console.log('USING MOCK TESTS');
  }


  function setOptions(options) {
    // create & set up default options
    if (!options) {
      options = {};
    }

    if (!options.recordFilter) {
      options.recordFilter = (config) => {
        return true;
        return config.path[0] === '/' &&
          config.path != '/hcc/main' &&
          (config.method == 'GET' ||
            config.method == 'DELETE' ||
            config.method == 'PUT' ||
            config.method == 'POST');
      }
    }

    if (options.isCustomMock == undefined) {
      options.isCustomMock = false;
    }
    currentOptions = options;
    return options;
  }

  function getApiKey(api) {
    let path = api.path;
    if (api.url) {
      path = parseUri(api.url).path;
    }

    return api.method + '.' + path;
  }

  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License

  function parseUri(str) {
    var o = parseUri.options,
      m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
  };

  parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

}
