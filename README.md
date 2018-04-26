## Automocker Instructions and Explanation

This Github repository contains a testing library we call the Automocker, built on the open-source testing platform called [Cypress.io](https://www.cypress.io/). The library allows users to quickly and confidently build unit or end to end tests that record API calls along with their results, and then be able to test against those recorded API calls as if the front end was interacting a the real server. The following documentation will help you run the library and will explain the process each step of the way. After familiarizing with the example application, this guide will explain how to integrate the Automocker into your own application.

##### Explaination and Sample Web Application Test

To start, you will see 3 subfolders within the head directory:
1. example: Contains a simple application to test against and implements API’s with changing responses, along with an example Cypress test to exemplify the Automocker library.
2. include-in-tests: Conaitns a library to include in your in your test suite,
3. include-in-webapp: Contains a library to include in your application that is being tested.

First we will run the example application found in `/cypressautomocker/example`:
```
git clone https://github.com/scottschafer/cypressautomocker.git
cd example
npm install --save-dev cypress
npm start --save cypressautomocker
```

At this point, you should see: `Example app listening at http://localhost:1337` which means that the local server is running on port 1337. If you would rather change this port to a different port, you may do this by changing the port number in the baseUrl of `/example-app-tests/cypress.json` which will be discussed later on. 

Now if you open a web browser and got to `http://localhost:1337` you will see the sample application running. Now it is time to run a testing example on this web app to familiarize yourself with the process. We will find a test in the `/example/cypress/integration` directory.

In a terminal window:
```
cd /example/cypress
```
In the cypress directory we have `fixtures`, `integration`, `plugins`, and `support` directories. These files contain your tests and custom commands you will use in your tests. These will be key when integrating the library into your own application. We will touch on them later. 

Now that we have an understanding of the file structure lets go back:
```
cd ..
```
We will see `cypress.json` which is an important component to our testing process. Although we are not limited to three fields, the file starts with _baseUrl_, _automockRecord_, and _automockPlayback_ fields. _baseUrl_ is the url that our tests will be running on. Likely, we will point this at a locally hosted web app in order to test it, but in some cases we may want to point this to a live server to record API calls from your production server. Once our test is pointed at the correct URL (in our case `localhost:1337` for the example app) we will want to record the API calls the application is making in order to test that the front end is making the appropriate requests in the future. In order to record API calls while running a test on the app, set _automock.record_ to **true** and _automock.playback_ to **false**. When we run the test for the first time, it will automatically generate a folder to store your mocked data:
```
/example/cypress/automocks
```
The first time you run the the test, regardless of what your settings are if this folder has not been generated, it will generate it for you and record the API calls. Any API calls that are recorded throughout a given test will be written to a JSON (JavaScript Object Notation) file which will be labeled _name-of-your-test.json_ and will be saved into the automocks directory (technically, the data file will be whatever you choose to name it within your Cypress test but it is good practice to keep the names of your tests and data consistent). Each test you run with this setting will save each API call in the form of a JSON object within the file for that particular test. Once the folder is populated with any data, you will be required to use the appropriate settings explained above to record the data and replace the old JSON file with an updated one.

So lets give it a try (go to the `example` directory):
```
./node_modules/cypress/bin/cypress open
```
In the GUI that pops up you should see `testCounter_spec.js` underneath integration tests. By clicking on that file you will run that test with the given settings you provided in `/example/cypress.json`. Now run the test. The typical Cypress window should pop up displaying the web app and the test progress. On the left hand side you will be able to identify the different API calls that are being triggered and therefore recorded in this instance. Also, if you open the developer tools and look at the console you will see a log of all the API recordings. This will help you keep track of all the API calls being made and help you debug in more complicated circumstances. 

Now if we go back to the `example/cypress` directory we can see the `automocks` directory which contains the latest recording. By opening the `testCounter.json` file, we can see all of the API call responses saved as JSON objects as expected. Now it is time to use this data to mock the the server. Cypress has a command called _cy.route()_ which allows users to write tests where incoming API calls are stubbed and re-routed back to the frontend. The Automocker library takes all of the data recorded in our first (or recorded) test run, and feeds it into Cypress’s _cy.route()_ commands so that each of those API calls will be stubbed with the appropriate response data when they are called. 

Let’s now change our settings in `/example/cypress.json` so that we can use the recorded data. Change _automock.playback_ to **true** if it isn’t already set to true. By doing this, along with the fact that the automoker directory is already populated with data, we are enabling the Automocker to read the .json file already in the `cypress/automocks` directory rather than recording a new session. 

After stopping the previous test that we ran in Cypress.io we now run the same test again. You will notice that all the assertions have passed, and that each of the API calls will say stubbed, rather than just XHR like we saw in the pervious recording test iteration. If you open up the developer tools again, you will notice that each of the mocked API calls are logged to the console.

##### Integrationing Into Your Own Web Application

Now you have an understanding of how the Automocker works! Of course for it to be any use, you will have to integrate it into your own web application, and build a suite of relevant tests to ensure that development runs smoothly and efficiently. The following guidelines will help you do so. 

To start integration into your own web application, go to the directory containing your app within the command line and type:
```
git clone https://github.com/scottschafer/cypressautomocker.git
cd "to-your-web-app"
npm install --save-dev cypress
npm start --save cypressautomocker
```
Then you will need to include the Automocker cypress commands within your `commands.js` file:
```
cd cypress/support/
vi commands.js
```
Add the following lines of code to the file:
```
import registerAutoMockCommands from 'cypressautomocker/include-in-tests';
registerAutoMockCommands();
```
Then, you will need to go to your web application on the front end and install the Cypress hooks. Where exactly this is depends on the layout of your own application, and the following code applies specifically to the example app explained above. It is likely that your application will be structured similarly, and that the only thing differing in the code below (if anything) will be the name of the file or directory you put it in:
```
cd ../../src/
vi client.js
```
Now add the following code:
```
import installCypressHooks from 'cypressautomocker/include-in-webapp';
installCypressHooks();
```
Another option to do the same thing would be to include the following code in your HTML instead:
```
<script src="node_modules/cypressautomocker/include-in-webapp/installCypressHooks-norequire.js">
```
Chances are, you already installed Cypress into your web application. If that is the case, you will need to add code to your `cypress.json` file:
```
cd ../..
vi cypress.json
```
Add the following code:
```
"automocker": {
  "record": false,
  "playback": true
}
```
Now you are ready to develop your suite of tests and start using the Automocker library, except that you have to structure your tests in a way that will implement the use of the library. In `/example-app-tests/cypress/integration/testCounter_spec.js.` you will notice the following structure that you should follow with your tests in order successfully use the Automocker. Make sure to include this general structure in your tests:
```
describe('description-for-test', function () {

  const MOCK_FILENAME = 'name-of-file';

  before(() => {
    cy.automock(MOCK_FILENAME);
  });

  beforeEach(() => {
  });

  after(() => {
    cy.automockEnd();
  });

  afterEach(() => {
    cy.waitOnPendingAPIs();
  });

  it('description-for-it', function () {
    //testing-code
  });

  it('description-for-it', function () {
    //testing-code
  });
})
```
Now you are all set to use the Automocker!

If you find any bugs in the Automocker while using it please make sure to let us know so we can continue to improve its functionality.

Best of Luck!
