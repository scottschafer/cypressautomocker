// hooks to allow cypress recording & mocking

(function () {

  // no-op if window.Cypress.autoMock is not defined
  if (!window.Cypress || !window.Cypress.autoMocker) {
    return; // no-op
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
  var autoMocker = window.Cypress.autoMocker;

  var FakeXMLHttpRequest = function () {
    if (typeof window.OriginalXHR !== 'function') {
      throw new Error('Original XMLHttpRequest not found. Did you forget to call FakeXMLHttpRequest.setup()?');
    }
    this.object = new window.OriginalXHR();
    var fakeRequest = this;

    this.object.onabort = function (ev) {
      if (typeof fakeRequest.onabort === 'function') {
        fakeRequest.onabort(ev);
      }
      if (autoMocker.onabort) {
        autoMocker.onabort(ev);
      }
    };

    this.object.onerror = function (ev) {
      if (typeof fakeRequest.onerror === 'function') {
        fakeRequest.onerror(ev);
      }
      if (autoMocker.onerror) {
        autoMocker.onerror(ev);
      }
    };

    this.object.onload = function (ev) {
      if (typeof fakeRequest.onload === 'function') {
        fakeRequest.onload(ev);
      }
      if (autoMocker.onload) {
        autoMocker.onload(ev);
      }
    };

    this.object.onloadend = function (ev) {
      if (typeof fakeRequest.onloadend === 'function') {
        fakeRequest.onloadend(ev);
      }
      if (autoMocker.onloadend) {
        autoMocker.onloadend(ev);
      }
    };

    this.object.onloadstart = function (ev) {
      if (typeof fakeRequest.onloadstart === 'function') {
        fakeRequest.onloadstart(ev);
      }
      if (autoMocker.onloadstart) {
        autoMocker.onloadstart(ev);
      }
    };

    this.object.onprogress = function (ev) {
      if (typeof fakeRequest.onprogress === 'function') {
        fakeRequest.onprogress(ev);
      }
      if (autoMocker.onprogress) {
        autoMocker.onprogress(ev);
      }
    };

    this.object.ontimeout = function (ev) {
      if (typeof fakeRequest.ontimeout === 'function') {
        fakeRequest.ontimeout(ev);
      }
      if (autoMocker.ontimeout) {
        autoMocker.ontimeout(ev);
      }
    };

    this.object.onreadystatechange = function (ev) {
      fakeRequest.readyState = fakeRequest.object.readyState;
      fakeRequest.status = fakeRequest.object.status;
      fakeRequest.statusText = fakeRequest.object.statusText;
      fakeRequest.response = fakeRequest.object.response;
      if (fakeRequest.responseType === '') {
        fakeRequest.responseText = fakeRequest.object.responseText;
        fakeRequest.responseXML = fakeRequest.object.responseXML;
      }
      fakeRequest.responseURL = fakeRequest.object.responseURL;
      if (typeof fakeRequest.onreadystatechange === 'function') {
        fakeRequest.onreadystatechange(ev);
      }
      if (autoMocker.onreadystatechange) {
        autoMocker.onreadystatechange(ev);
      }
    };

    this.onabort = null;
    this.onerror = null;
    this.onload = null;
    this.onloadend = null;
    this.onloadstart = null;
    this.onprogress = null;
    this.onreadystatechange = null;
    this.ontimeout = null;

    this.readyState = XMLHttpRequest.UNSENT;
    this.responseHeaders = {};
    this.response = '';
    this.responseText = '';
    this.responseType = '';
    this.responseURL = '';
    this.responseXML = '';
    this.status = 0;
    this.statusText = '';
    this.timeout = 0;
    this.upload = null;
    this.withCredentials = false;
  }

  FakeXMLHttpRequest.prototype = {
    method: '',
    url: '',

    open: function open(method, url, async, user, password) {
      this.method = method;
      if (!url) {
        debugger;
      }
      this.url = url;
      this.object.responseType = this.responseType;
      this.object.method = method;
      this.object.open(method, url, typeof async === 'boolean' ? async : true, typeof user === 'undefined' ? null : user,
        typeof password === 'undefined' ? null : password);
    },

    send: function send(data) {
      this.requestBody = data;
      this.object.responseType = this.responseType;
      var matched = false;
      var request = this;
      var matchedItem = null;

      FakeXMLHttpRequest.handlers.forEach(function (item) {
        if (typeof item.url === 'string' && item.url === request.url || item.url instanceof RegExp && item.url.test(request.url)) {
          if (typeof item.method !== 'string' || item.method.toUpperCase() === request.method.toUpperCase()) {
            matched = true;
            matchedItem = item;
          }
        }
      });

      if (autoMocker.mockResponse) {
        matchedItem = autoMocker.mockResponse(this);
        if (matchedItem) {
          matched = true;
        }
      }

      if (matchedItem) {
        var item = matchedItem;

        var handleResponse = function handleResponse() {
          if (typeof request.onloadstart === 'function') {
            request.onloadstart();
          }
          // prepare arguments
          var args = [];
          if (item.url instanceof RegExp) {
            // get the matches from the regular expression
            args = item.url.exec(request.url);
            args.push(data);
          } else {
            args = [request.url, data];
          }
          // set response headers
          var responseHeaders = null;
          if (typeof item.headers === 'function') {
            responseHeaders = item.headers.apply(null, args);
          } else if (_typeof(item.headers) === 'object') {
            responseHeaders = item.headers;
          }
          if (responseHeaders && (typeof responseHeaders === 'undefined' ? 'undefined' : _typeof(responseHeaders)) === 'object') {
            for (var name in responseHeaders) {
              if (responseHeaders.hasOwnProperty(name)) {
                request.responseHeaders[name.toLowerCase()] = responseHeaders[name];
              }
            }
          }
          request.status = item.status;
          request.statusText = item.statusText;
          request.readyState = XMLHttpRequest.HEADERS_RECEIVED;
          if (typeof request.onreadystatechange === 'function') {
            request.onreadystatechange();
          }
          request.readyState = XMLHttpRequest.LOADING;
          if (typeof request.onreadystatechange === 'function') {
            request.onreadystatechange();
          }
          if (typeof item.response === 'string' || typeof item.response === 'function') {
            var response = '';
            if (typeof item.response === 'string') {
              response = item.response;
            } else {
              response = item.response.apply(null, args);
            }
            request.response = response;
            if (request.responseType === '' || request.responseType === 'text') {
              request.responseText = item.response;
            }
            if (request.responseType === 'document') {
              request.responseXML = item.response;
            }
            request.readyState = XMLHttpRequest.DONE;
            if (typeof request.onreadystatechange === 'function') {
              request.onreadystatechange();
            }
            if (typeof request.onload === 'function') {
              request.onload();
            }
            if (typeof request.onloadend === 'function') {
              request.onloadend();
            }
          } else if (typeof item.proxy === 'string' || typeof item.proxy === 'function') {
            var url = '';
            if (typeof item.proxy === 'string') {
              url = item.proxy;
            } else {
              url = item.proxy.apply(null, args);
            }
            if (typeof url === 'string' && url.length > 0) {
              var proxyRequest = new XMLHttpRequest();
              proxyRequest.onreadystatechange = function () {
                if (proxyRequest.readyState === XMLHttpRequest.DONE && proxyRequest.status === 200) {
                  request.status = item.status;
                  request.statusText = item.statusText;
                  request.response = proxyRequest.response;
                  request.readyState = XMLHttpRequest.DONE;
                  if (request.responseType === '' || request.responseType === 'text') {
                    request.responseText = proxyRequest.response;
                  }
                  if (request.responseType === 'document') {
                    request.responseXML = proxyRequest.response;
                  }
                  request.readyState = XMLHttpRequest.DONE;
                  if (typeof request.onreadystatechange === 'function') {
                    request.onreadystatechange();
                  }
                  if (typeof request.onload === 'function') {
                    request.onload();
                  }
                  if (typeof request.onloadend === 'function') {
                    request.onloadend();
                  }
                }
              };
              proxyRequest.open('GET', url);
              proxyRequest.send();
            }
          }
        };

        if (typeof item.responseTime === 'number') {
          setTimeout(handleResponse, item.responseTime);
        } else if (_typeof(item.responseTime) === 'object' && item.responseTime.length === 2) {
          setTimeout(handleResponse, Math.random() * (item.responseTime[1] - item.responseTime[0]) + item.responseTime[0]);
        } else {
          handleResponse();
        }
      }

      if (!matched) {
        this.object.send(data);
      }
    },

    abort: function abort() {
      this.object.abort();
    },

    setRequestHeader: function setRequestHeader(header, value) {
      this.object.setRequestHeader(header, value);
    },

    getResponseHeader: function getResponseHeader(header) {
      if (this.responseHeaders.hasOwnProperty(header.toLowerCase())) {
        return this.responseHeaders[header.toLowerCase()];
      }
      return this.object.getResponseHeader(header);
    },

    getAllResponseHeaders: function getAllResponseHeaders() {
      return this.object.getAllResponseHeaders();
    },

    overrideMimeType: function overrideMimeType(mimeType) {
      this.object.overrideMimeType(mimeType);
    }
  };
  FakeXMLHttpRequest.prototype.constructor = FakeXMLHttpRequest;
  FakeXMLHttpRequest.setup = function () {
    window.OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = FakeXMLHttpRequest;
    FakeXMLHttpRequest.handlers = [];
  };
  FakeXMLHttpRequest.restore = function () {
    FakeXMLHttpRequest.handlers = [];
    window.XMLHttpRequest = window.originalXHR;
    delete window.originalXHR;
  };
  FakeXMLHttpRequest.addHandler = function (handler) {
    FakeXMLHttpRequest.handlers.push(handler);
  };
  FakeXMLHttpRequest.UNSENT = XMLHttpRequest.UNSENT;
  FakeXMLHttpRequest.OPENED = XMLHttpRequest.OPENED;
  FakeXMLHttpRequest.LOADING = XMLHttpRequest.LOADING;
  FakeXMLHttpRequest.HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED;
  FakeXMLHttpRequest.DONE = XMLHttpRequest.DONE;

  FakeXMLHttpRequest.setup();

  // parseUri 1.2.2
  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License

  function parseUri(str) {
    var o = parseUri.options,
      m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i = 14;

    while (i--) {
      uri[o.key[i]] = m[i] || "";
    }
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) {
        uri[o.q.name][$1] = $2;
      }
    });

    return uri;
  };

  parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query",
      "anchor"
    ],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  }
})();
