import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './app';
import Editor from './editor'

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/editor" component={Editor} />
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('app'))