import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Counter from './components/Counter';
import express from 'express';
import url from 'url';

let app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files from the 'public' folder
app.use(express.static('public'));

// GET /
app.get('/', function (req, res) {
  res.render('layout', {
    content: ReactDOMServer.renderToString(<Counter />)
  });
});

// Start server
let server = app.listen(1337, function () {
  let host = server.address().address;
  let port = server.address().port;

  if (host === '::') {
    host = 'localhost';
  }

  console.log('Example app listening at http://%s:%s', host, port);
});

var counter = 0;

app.get('/counter', function (req, res) {
  res.send('' + counter);
})

app.delete('/counter', function (req, res) {
  counter = 0;
  res.send('counter reset');
})


app.post('/counter', function (req, res) {  
  const query = url.parse(req.url, true).query;
  function respond() {
    if (query.increment) {
      counter += parseInt(query.increment);
    } else {
      ++counter;
    }
    res.send('In case you care, sqrt(' + counter + ') = ' + Math.sqrt(counter));
  }

  if (query.delay) {
    setTimeout(respond, parseInt(query.delay));
  } else {
    respond();
  }
})
