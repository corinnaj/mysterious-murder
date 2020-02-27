import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import App from './game/app';
import Editor from './editor/editor'
import { DndProvider } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch'

const Root: React.FC = () => {
  return <Router>
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div style={{height: '100%'}}>
        <Route exact path="/" component={App} />
        <Route path="/editor" component={Editor} />
      </div>
    </DndProvider>
  </Router>
}

ReactDOM.render(<Root />, document.getElementById('app'))
