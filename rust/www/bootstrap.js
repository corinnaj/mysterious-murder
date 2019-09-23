import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect, createRef } from 'react'
import ReactDOM from 'react-dom'
import Container from 'react-bootstrap/Container';
import { iconMappings, male, female, feelingIconMapping, objectIconMapping, moodIconMapping, relationshipIconMapping, ruleIconMapping } from './emojis'
import { murderMysteryRuleset } from './murder_mystery'
import { IdCards } from './id_cards'
import { TargetArea } from './target_area'
import * as d3 from 'd3'
import * as d3Graphviz from 'd3-graphviz'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import faker from 'faker';
let actors = createActors();

function createActors() {
  return [0, 1, 2, 3].map(index => ({
    icon: [...male, ...female][parseInt(Math.random() * (male.length + female.length))],
    name: faker.name.firstName() + " " + faker.name.lastName(),
    age: 32,
    index,
  }))
}

function PredicateDisplay({ predicate }) {
  console.log(predicate)
  return <div className="predicate emoji">
    <span key={predicate.actors[0].index} className="predicate-actor-icon">{actors[predicate.actors[0]].icon}</span>
    <span className="predicate-rule-icon">{iconMappings[predicate.name] || predicate.name}</span>
    {predicate.actors.slice(1).map(a => <span key={a.index} className="predicate-actor-icon">{actors[a].icon}</span>)}
  </div>
}

function CollectionDisplay({ predicates }) {
  return <div className="predicate emoji">
    {predicates.map((p, i) => <span key={i} className="predicate-rule-icon">{iconMappings[p.name] || p.name}</span>)}
  </div>
}

function Graph({ dot }) {
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
  const [witnessLog, setWitnessLog] = useState([])
  const [graph, setGraph] = useState('')
  const [answer, setAnswer] = useState(undefined)
  const [droppedActors, setDroppedActors] = useState([undefined, undefined])
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState(20);

  function graphFromAction({ inputs, outputs, name: actionName, actors: actionActors }) {
    const finalInputs = inputs.map(i => {
      const id = idForPredicateInstance(i);
      return { id, node: `n${id} [label="${emojisForPredicateInstance(i)}"]` }
    })
    const finalOutputs = outputs.map(i => {
      const id = idForPredicateInstance(i);
      return { id, node: `n${id} [label="${emojisForPredicateInstance(i)}"]` }
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

  function AnswerArea() {
    return answer == undefined || (Array.isArray(answer) && answer.length == 0)
      ? <p>No Predicates found</p>
      : (Array.isArray(answer)
        ? <CollectionDisplay predicates={answer} />
        : <PredicateDisplay predicate={answer.rule} key={idForPredicateInstance(answer.rule)} />
      )
  }

  function witness(data) {
    if (Math.random() < 0.5) {
      const possibleWitnesses = (actors.filter(a => !data.actors.includes(a)));
      const witness = possibleWitnesses[Math.floor(Math.random() * possibleWitnesses.length)];
      setWitnessLog(witnessLog => [...witnessLog, {rule: data, witness: witness}])
    }
  }

  useEffect(() => {
    setLoading(true);
    const worker = new Worker('worker.js')
    worker.addEventListener('message', event => {
      if (event.data == 'ready')
        return worker.postMessage({
          'run': murderMysteryRuleset,
          'seed': seed,
        })

      let data = JSON.parse(event.data)
      if (data.type == 'action') {
        setLog(log => [...log, data])
        witness(data);
        setGraph(graph => graph + graphFromAction(data))
      } else if (data.type == 'abort')  {
        replay();
      } else if (data.type == 'state')  {
        setSimulationState(state => data.state.map(p => ({ ...p, actors: p.actors.map(index => actors[index]) })))
        setLoading(false)
      }
    })
  }, [seed])

  function askQuestion(actors, predNames, type) {
    if (type == 'object') {
      let allPreds = simulationState.filter(p => p.actors[0] == actors[0] && iconMappings[p.name] && predNames.includes(p.name));
      allPreds = actors[1] != undefined ? allPreds.filter(p => p.actors[1] == actors[1]) : allPreds;
      if (allPreds.length == 0) return undefined;
      return allPreds;
    } else {
      let allRules = witnessLog.filter(p => p.witness == actors[0] && p.rule.actors.includes(actors[1].index))
      return allRules[Math.floor(Math.random() * allRules.length)];
    }
  }

  function LoadingModal() {
    return <Modal
      show={loading}
      animation={false}
      aria-labelledby="loading-title"
      >
      <Modal.Header className="centered">
        <Modal.Title id="loading-title" className="centered">
          Generating your Murder Mystery
          </Modal.Title>
      </Modal.Header>
      <Modal.Body className="centered">
        <p>This will take about 15 seconds. Please stand by...</p>
        <Spinner animation="border" />
      </Modal.Body>
    </Modal>
  }

  function AccuseModal(props) {
    const rule = log[log.length - 1];
    const actor = droppedActors[0];
    if (rule == undefined || actor == undefined || rule.actors == undefined || rule.actors.length < 1) return <div></div>;
    const correct = rule.actors[0] == actor.index;
    const murderer = actors[rule.actors[0]];
    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="modal-title"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="modal-title">
            {correct ? "You are correct!" : "Crime paid off!"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {correct ? actor.name + " confesses immediatly!" : "It was actually " + murderer.name}
          </p>
        </Modal.Body>
        <Modal.Footer className="opposite">
          <Button onClick={props.onShowGraph}>Show Me What Happened</Button>
          <Button variant="success" onClick={props.onHide}>Play Again</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function accuse() {
    setModalShow(true)
  }

  function renderSinglePersonButtons(actor) {
    return <div className="horizontal-row">
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor], Object.keys(objectIconMapping), 'object'))}>
        Possessions
      </Button>
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor], Object.keys(moodIconMapping), 'object'))}>
        Current Mood
      </Button>
      <Button
        variant="danger"
        className="question-button"
        onClick={() => accuse()}>
        Accuse
      </Button>
    </div>
  }

  function renderTwoPersonButtons(actor1, actor2) {
    return <div className="horizontal-row">
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor1, actor2], Object.keys(relationshipIconMapping), 'object'))}>
        Relationship
      </Button>
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor1, actor2], Object.keys(feelingIconMapping), 'object'))}>
        Feelings
      </Button>
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor1, actor2], Object.keys(ruleIconMapping), 'predicate'))}>
        Facts
      </Button>
    </div>
  }

  function setActor(actor, index) {
    setDroppedActors(droppedActors.map((a, i) => index === i ? actor : a))
  }

  function showGraph() {

  }

  function replay() {
    setModalShow(false);
    actors = createActors();
    setSimulationState([])
    setLog([])
    setWitnessLog([])
    setGraph('')
    setAnswer(undefined)
    setDroppedActors([undefined, undefined])
    setSeed(parseInt(Math.floor(Math.random() * 64)));
  }

  function isVictim(actor) {
    const rule = simulationState.filter(p => p.name == "dead" && p.actors[0] == actor)
    return rule.length > 0;
  }

  return <div>
    <AccuseModal
      show={modalShow}
      onHide={() => {setModalShow(false); replay()}}
      onShowGraph={() => showGraph()}
    />
    <LoadingModal />
    {/*<Graph dot={graph} />*/}
    <DndProvider backend={HTML5Backend}>
      <Container fluid={true} className="main">
        {actors != null ? <IdCards actors={actors} isVictim={(actor) => isVictim(actor)} /> : <div/>}
        <div className="horizontal-row">
          <TargetArea index={0} onDrop={(actor) => setActor(actor, 0)} droppedActor={droppedActors[0]} isVictim={(actor) => isVictim(actor)} />
          <TargetArea index={1} onDrop={(actor) => setActor(actor, 1)} droppedActor={droppedActors[1]} isVictim={(actor) => isVictim(actor)} />
        </div>
        {droppedActors[0] != undefined && droppedActors[1] == undefined
          ? renderSinglePersonButtons(droppedActors[0])
          : <div></div>
        }
        {droppedActors[0] != undefined && droppedActors[1] != undefined
          ? renderTwoPersonButtons(droppedActors[0], droppedActors[1])
          : <div></div>
        }
        <AnswerArea />
        {/*<div className="event-log">{log.map((item, i) => <div key={i}>{JSON.stringify(item)}</div>)}</div>*/}
      </Container>
    </DndProvider>
  </div>
}

ReactDOM.render(<App />, document.getElementById('app'))
