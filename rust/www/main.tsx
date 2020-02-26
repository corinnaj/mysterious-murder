import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './game/app';
import Editor from './editor/editor'
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

const routing = (
  <Router>
    <DndProvider backend={HTML5Backend}>
      <div>
        <Route exact path="/" component={App} />
        <Route path="/editor" component={Editor} />
      </div>
    </DndProvider>
  </Router>
)

ReactDOM.render(routing, document.getElementById('app'))