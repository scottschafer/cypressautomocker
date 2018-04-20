# Simple Universal React.js "Hello world" Application

Simplest possible starting point for using universal/isomorphic/shared React.js +
Node.js + Express.js

# Installation

Use Git to clone this app, then:

```
npm install
```

# Commands

Start the server with all the code transpiled and bundled in a single command:

```
npm run start
```

Transpile all the ES6/ES2015 JavaScript to ES5 for Node and browsers

```
npm run build
```

Bundle all the client-side JavaScript into a single file (`public/js/bundle.js`)

```
npm run bundle
```

# Why?

After spending some time searching for universal/isomorphic starter projects to
learn from, nearly every one of them:

 * Had a list of NPM dependencies longer than my screen viewport.
 * Included more dotfiles than source files.
 * Made other technology decisions for me, like SASS/Less, Mocha/Jasmine, Webpack/Gulp/Grunt, which implementation of Flux to use, etc.
 * Had too much code and/or too many concepts to learn at once.

This project:

 * Is NOT opinionated
 * Does NOT make any tech choices for you beyond Express.js + React.js
 * Does NOT include any CSS pre-processor or framework
 * Does NOT include any testing framework
 * Does NOT include any specific build tool config (Gulpfile, Gruntfile, etc.)
 * Uses ES6/ES2015 for all JavaScript you write
 * Uses React.js on both the client AND server ([Universal
   JavaScript](https://medium.com/@mjackson/universal-javascript-4761051b7ae9))
   so you can pre-render your initial React.js components for faster initial
   page load speed and better SEO.

So in essense, this project is a good example starter project for learning how
to render React.js components on both the client and server side, and then lets
you take it from there.

