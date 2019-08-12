import React, {useState, useEffect, createRef} from 'react'
import ReactDOM from 'react-dom'
import {iconMappings, male, female} from './emojis'
import {murderMysteryRuleset} from './murder_mystery'
import * as d3 from 'd3'
import * as d3Graphviz from 'd3-graphviz'

const actors = [0, 1, 2, 3].map(index => ({
  icon: [...male, ...female][parseInt(Math.random() * (male.length + female.length))],
  index,
}))

function PredicateDisplay({predicate}) {
  return <div className="predicate">
    <span className="predicate-rule-icon">{iconMappings[predicate.name] || predicate.name}</span>
    {predicate.actors.map(a => <span key={a.index} className="predicate-actor-icon">{a.icon}</span>)}
  </div>
}

function ActorProfile({actor, state, actors}) {
  return <div className="actor-profile">
    <div className="actor-icon">{actor.icon}</div>
    {state.filter(p => p.actors[0] == actor && iconMappings[p.name]).map((p, i) =>
      <PredicateDisplay predicate={p} key={i}/>
    )}
  </div>
}

function Graph({dot}) {
  const ref = createRef()
  useEffect(() => {
    d3.select(ref.current).graphviz().renderDot(`digraph {
      node [shape=box, margin=0.01, height=0, width=0, fontsize=7]; ${dot}}`)
  }, [dot])
  return <div ref={ref} className="graph"></div>
}

let globId = 0
function idForPredicateInstance(p) {
  return p.name + p.actors.join('')
}

function emojisForPredicateInstance(p) {
  return p.name + ' ' + p.actors.map(a => actors[a].icon).join(' ')
}

function App() {
  const [simulationState, setSimulationState] = useState([])
  const [log, setLog] = useState([])
  const [graph, setGraph] = useState('')

  function graphFromAction({inputs, outputs, name: actionName, actors: actionActors}) {
    const finalInputs = inputs.map(i => {
      const id = idForPredicateInstance(i);
      return {id, node: `n${id} [label="${emojisForPredicateInstance(i)}"]`}
    })
    const finalOutputs = outputs.map(i => {
      const id = idForPredicateInstance(i);
      return {id, node: `n${id} [label="${emojisForPredicateInstance(i)}"]`}
    })
    const actionId = ++globId;
    const actionNode = `n${actionId} [fontsize=16, label="${actionName} ${actionActors.map(a => actors[a].icon).join('')}"]`;

    return [
      ...finalInputs.map(i => i.node),
      ...finalOutputs.map(i => i.node),
      actionNode,
      ...finalInputs.map(i => `n${i.id} -> n${actionId}`),
      ...finalOutputs.map(i => `n${actionId} -> n${i.id}`)
    ].join(';') + ';'
  }

  useEffect(() => {
    const worker = new Worker('worker.js')
    worker.addEventListener('message', event => {
      if (event.data == 'ready')
        return worker.postMessage({
          'run': murderMysteryRuleset,
          'seed': 20,
        })

      let data = JSON.parse(event.data)
      if (data.type == 'action') {
        setLog(log => [...log, event.data])
        setGraph(graph => graph + graphFromAction(data))
      } else if (data.type == 'state')
        setSimulationState(state => data.state.map(p => ({...p, actors: p.actors.map(index => actors[index])})))
    })
  }, [])

  return <div>
    {actors.map(actor =>
      <ActorProfile key={actor.index} actor={actor} actors={actors} state={simulationState}/>
    )}
    <Graph dot={graph}/>
    <div className="event-log">{log.map((item, i) => <div key={i}>{item}</div>)}</div>
  </div>
}

ReactDOM.render(<App />, document.getElementById('app'))

