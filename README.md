## Automocker Instructions and Explanation

This Github repository contains a testing library we call the Automocker, built on the open-source testing platform called [Cypress.io](https://www.cypress.io/). The library allows people to quickly and confidently build unit or end to end tests that record API calls and their results, and then be able to test against those recorded API calls as if the front end was interacting a the real server. The following documentation will help you run the library and will explain the process each step of the way.

To start, you will see 4 subfolders within the head directory:
1. example-app: Contains a simple application to test against and implements API’s with changing responses.
2. example-app-tests: Contains Cypress.io tests to run against the example-app.
3. include-in-tests: Conaitns a library to include in your in your test suite,
4. include-in-webapp: Contains a library to include in your application that is being tested.

First we will run the example-app:
```
git clone https://github.com/scottschafer/cypressautomocker.git
cd example-app
npm install
npm start
```

At this point, you should see: `Example app listening at http://localhost:1337` which means that the local server is running on port 1337. If you would rather change this port to a different port, you may do this by changing the port number in the baseUrl of `/example-app-tests/cypress.json` which will be discussed later on. 

Now if you open a web browser and got to `http://localhost:1337` you will see the sample application running. Now it is time to run a testing example on this web app to familiarize yourself with the process. We will find a test in the example-app-tests directory.

In a terminal window:
```
cd /example-app-tests/cypress
```
In the cypress directory we have fixtures, integration, plugins, and support directories. The integration directory is used to store integration tests written with Cypress. We can build you suite of tests for your web app inside this directory. In the support directory we will find commands.js where you can create custom Cypress commands to help write tests with. Back in the fixtures directory we can store data which you can use in your tests for whatever purpose. 

Now that we have an understanding of the file structure lets go back:
```
cd ..
```
We will see `cypress.json` which is an important component to our testing process. Although we are not limited to three fields, the file starts with _baseUrl_, _automockRecord_, and _automockPlayback_ fields. _baseUrl_ is the url that our tests with be running on. Likely, we will point this at a locally hosted web app in order to test it, but in some cases we may want to point this to a live server to record API calls from your production server. Once our test is pointed at the correct URL (in our case `localhost:1337` for the example-app) we will want to record the API calls the application is making in order to test that the front end is making the appropriate requests in the future. In order to record API calls while running a test on the app, set _automockRecord_ to **true** and _automockPlayback_ to **false**. When we run the test for the first time, it will automatically generate a folder to store your mocked data:
```
/example-app-tests/automocks
```
The first time you run the the test, regardless of what your settings are if this folder has not been generated, it will generate it for you and record the API calls. Any API calls that are recorded throughout a given test will be written to a JSON (JavaScript Object Notation) file which will be labeled name-of-your-test.json and will be saved into the automocks directory (technically, the data file will be whatever you choose to name it within your Cypress test but it is good practice to keep the names of your tests and data consistent). Each test you run with this setting will save each API call in the form of a JSON object within the file for that particular test. Once the folder is populated with any data, you will be required to use the appropriate settings explained above to record the data and replace the old JSON file. 

So lets give it a try. If you have not installed [Cypress.io](https://www.cypress.io/), do so now… Once installed:
```
cypress open
```
In the GUI that pops up, select the `example-app-testing folder`. Once you do so you will find the the `testCounter_spec.js` in the GIU. By clicking on that file you will run that test with the given settings you provided in `/example-app-tests/cypress.json`. Now run the test. The typical Cypress.io window should pop up displaying the web app and the test progress. On the left hand side you will be able to identify the different API calls that are being called and therefore recorded in this instance. Also, if you open the developer tools and look at the console you will see the each API recording logged into it. This will help you keep track of all the API calls being made and help you debug in more complicated circumstances. 

Now if we go back to the `example-app-tests` directory we can see the `automocks` directory which contains the latest recording. By opening the `testCounter.json` file, we can see all of the API call responses saved as JSON objects as mentioned earlier. Now it is time to use this data to mock the the server side code. Cypress has a command called _cy.route()_ which allows users to write tests where incoming API calls are stubbed and re-routed back to the frontend. The Automocker library takes all of the data recorded in our first test run, and feeds it into Cypress’s _cy.route()_ commands so that each of those API calls will be stubbed with the appropriate response data when they are called. 

Let’s now change our settings in `/example-app-tests/cypress.json` so that we can use the recorded data. Change _automockPlayback_ to **true** if it isn’t already set to true. By doing this, along with the fact that the automoker directory is already populated with data, we are enabling the Automocker to read the .json file already in the `automocks` directory rather than recording a new session. 

After stopping the previous test that we ran in Cypress.io we now run the same test again. You will notice that all the assertions have passed, and that each of the API calls will say stubbed, rather than just XHR like we saw in the pervious recording test iteration. If you open up the developer tools again, you will notice that each of the mocked API calls are logged to the console.

Now you are all set! In the future, you can add your own web app and suite of Cypress tests into the mix to assure that development runs smoothly and efficiently. For an example of how to structure each of your individual Cypress tests, look at `/example-app-tests/cypress/integration/testCounter_spec.js.` It is important to follow the general structure of the _before()_, _beforeEach()_, _after()_, and _afterEach()_ functions in order for the tests to successfully record and mock data!

Also, if you find any bugs in the Automocker while using it please make sure to let us know so we can continue to improve its functionality.

#####Best of Luck!
