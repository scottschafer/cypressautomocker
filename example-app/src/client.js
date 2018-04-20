import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import installCypressHooks from '../../include-in-webapp';

ReactDOM.render(<Counter />, document.getElementById('content'));

installCypressHooks();