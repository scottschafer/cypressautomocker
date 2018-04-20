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
  let isRecording = false;
  let recordedApis = [];

  // for mocking
  let isMocking = false;
  let apiKeyToMocks = {};
  let apiKeyToCallCounts = {};

  let completedPendingRequestsFunc = null;
  var pendingApiCount = 0;

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

  Cypress.Commands.add('automock', (sessionName, testDirPath, options) => {

    options = setOptions(options);

    // determine the mock file name
    if (sessionName.indexOf('.json') == -1) {
      sessionName += '.json';
    }

    cy.exec('pwd').then(result => {
      currentMockFileName = result.stdout + '/automocks/' + sessionName;

      cy.exec('ls ' + currentMockFileName, {failOnNonZeroExit: false}).then(result => {
        currentMockFileName = testDirPath + '/../../automocks/' + sessionName;
        if (result.code === 0) {
          // file exists, so mock APIs
          cy.readFile(currentMockFileName).then((contents) => {
            startApiMocking(contents);
          });
        } else {
          // file doesn't exist, so start recording
          if (!currentOptions.isCustomMock) {
            startApiRecording();
          }
        }
      });
    });
  });


  Cypress.Commands.add('automockEnd', () => {

    if (isRecording) {
      cy.waitOnPendingAPIs().then(() => {
        isRecording = false;
      })
      cy.writeMockServer();
    }
    isMocking = false;
  });

  Cypress.Commands.add('inspectRequests', (param1, param2) => {
    if (! isRecording) {
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
      const apis = JSON.stringify(recordedApis);

      cy.writeFile(currentMockFileName, apis);
      currentMockFileName = null;
    } else {
      currentMockFileName = null;
    }
  });


  window.Cypress.autoMocker = {
    mockResponse: (request) => {
      if (isMocking) {
        const key = getApiKey(request);
        if (apiKeyToMocks.hasOwnProperty(key)) {
          const apiCount = apiKeyToCallCounts[key]++;
          if (apiCount < apiKeyToMocks[key].length) {
            const mock = apiKeyToMocks[key][apiCount];
            if (mock) {
              return {
                status: mock.status,
                statusText: mock.statusText,
                response: mock.response
              };
            }
          }
        }
      } else if (isRecording) {

        function prepareOnLoadHandler(xhr) {
          (function() {
            const old_onload = xhr.onload;
            const url = xhr.url;
            const method = xhr.method;

            xhr.onload = () => {
              if (old_onload) {
                old_onload();
              }
              let parsed = parseUri(url);
              let query = '';
      
              // clone
              let requestObject = xhr.request ? JSON.parse(JSON.stringify(xhr.request)) : '';
              let responseObject = xhr.response ? JSON.parse(JSON.stringify(xhr.response)) : '';
              let transformedObject = {
                'method': method,
                'path': parsed.path,
                'query': parsed.query,
                'request': requestObject,
                'response': responseObject,
                'status': xhr.status,
                'statusText': xhr.statusText
              };
      
              if (currentOptions.recordFilter(transformedObject)) {
                recordedApis.push(transformedObject);
              }
            }    
          })();
        }
        prepareOnLoadHandler(request);
      }
      ++pendingApiCount;
      return false;
    },

    onloadstart: (event) => {
    },

    onloadend: (event) => {
      --pendingApiCount;
      if (! pendingApiCount && completedPendingRequestsFunc) {
        completedPendingRequestsFunc();
        completedPendingRequestsFunc = null;
      }
    }
  }

  function startApiRecording() {
    isRecording = true;
    recordedApis = [];
  }

  function startApiMocking(mocks) {
    isMocking = true;
    apiKeyToMocks = {};
    apiKeyToCallCounts = {};

    mocks.forEach(function(mock) {
      const key = getApiKey(mock);
      if (! apiKeyToMocks.hasOwnProperty(key)) {
        apiKeyToMocks[key] = [];
        apiKeyToCallCounts[key] = 0;
      }
      apiKeyToMocks[key].push(mock);
    });    

    console.log('USING MOCK TESTS');
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