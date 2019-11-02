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
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { getFullName } from 'local-names';
let actors = createActors();

function createActors() {
  return [0, 1, 2, 3].map(index => {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    return ({
      gender: gender,
      icon: gender == 'male'
        ? male[Math.floor(Math.random() * male.length)]
        : female[Math.floor(Math.random() * female.length)],
      name: getFullName(gender),
      age: 32,
      index,
    });
  })
}

const readablePredicate = predicate => predicate.name.replace('_', ' ')

function PredicateDisplay({ predicate }) {
  return <div className="predicate emoji horizontal-row">
    <span key={predicate.actors[0].index} className="predicate-actor-icon">{actors[predicate.actors[0]].icon}</span>
      <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{readablePredicate(predicate)}</Tooltip>}>
        <span className="predicate-rule-icon">{iconMappings[predicate.name] || predicate.name}</span>
      </OverlayTrigger>
    {predicate.actors.slice(1).map(a => <span key={a.index} className="predicate-actor-icon">{actors[a].icon}</span>)}
  </div>
}

function CollectionDisplay({ predicates }) {
  return <div className="predicate emoji horizontal-row">
    {predicates.map((p, i) =>
      <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{p.name}</Tooltip>}>
        <span key={i} className="predicate-rule-icon">{iconMappings[p.name] || p.name}</span>
      </OverlayTrigger>
    )}
  </div>
}

function Graph({ dot }) {
  const height = 600
  const ref = createRef()
  useEffect(() => {
    d3.select(ref.current).graphviz({height, width: 600}).renderDot(`digraph {
      node [shape=box, margin=0.01, height=0, width=0, fontsize=7]; ${dot}}`)
    d3.select(ref.current).select('svg').attr('width', '100%')
  }, [dot])
  return <div style={{height: height + 'px', width: '100%'}} ref={ref} className="graph"></div>
}

let globId = 0
function signatureForPredicateInstance(p) {
  return p.name + p.actors.join('')
}

function emojisForPredicateInstance(p) {
  return p.name + ' ' + p.actors.map(a => actors[a].icon).join(' ')
}

function randomSeed() {
    return parseInt(Math.floor(Math.random() * Math.pow(2, 32)));
}

// given a predicate instance signature, e.g. `anger 0 1`, store the current index used for deduplication
let indexMap = {}
const nextIndex = signature => indexMap[signature] = !indexMap[signature] ? 1 : indexMap[signature] + 1
const newResource = signature => {
  const id = signature + '_' + nextIndex()
  resourcesFor(signature).push(id)
  return id
}
// map predicate instances on a list of existing indices in the simulation state
let resourceMap = {}
const resourcesFor = signature => !resourceMap[signature]
  ? resourceMap[signature] = []
  : resourceMap[signature]

const ignorePredicates = ['alive']
const resetGraphResources = () => {
  indexMap = {}
  resourceMap = {}
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
  const [seed, setSeed] = useState(() => randomSeed());

  function graphFromAction({ inputs, outputs, name: actionName, actors: actionActors }) {
    const finalInputs = inputs.filter(i => !ignorePredicates.includes(i.name)).map(i => {
      const signature = signatureForPredicateInstance(i)
      let id = resourcesFor(signature).pop()
      if (id)
        return {id}
      id = signature + '_' + nextIndex(signature)
      return {id, node: `n${id} [label="${emojisForPredicateInstance(i)}"]`}
    })
    const finalOutputs = outputs.filter(i => !ignorePredicates.includes(i.name)).map(i => {
      const signature = signatureForPredicateInstance(i)
      const id = newResource(signature)
      return { id, node: `n${id} [label="${emojisForPredicateInstance(i)}"]` }
    })
    const actionId = ++globId;
    const fontSize = actionName.includes('murder') ? 32 : 16
    const actionNode = `n${actionId} [fillcolor=cyan, fontsize=${fontSize}, label="${actionName} ${actionActors.map(a => actors[a].icon).join('')}"]`;

    return [
      ...finalInputs.map(i => i.node).filter(n => !!n),
      ...finalOutputs.map(i => i.node).filter(n => !!n),
      actionNode,
      ...finalInputs.map(i => `n${i.id} -> n${actionId}`),
      ...finalOutputs.map(i => `n${actionId} -> n${i.id}`)
    ].join(';\n') + ';\n'
  }

  function AnswerArea() {
    return answer == undefined || (Array.isArray(answer) && answer.length == 0)
      ? <p className="horizontal-row bigger-font">None to speak of</p>
      : (Array.isArray(answer)
        ? <CollectionDisplay predicates={answer} />
        : <PredicateDisplay predicate={answer.rule} key={signatureForPredicateInstance(answer.rule)} />
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
    setLoading(true)
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
      } else if (data.type == 'abort') {
        replay();
      } else if (data.type == 'state') {
        setSimulationState(state => data.state.map(p => ({...p, actors: p.actors.map(index => actors[index])})))
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
        <p>This may take up to 1 minute. Please stand by...</p>
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
          <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Coming Soon!</Tooltip>}>
            <span className="d-inline-block">
              <Button disabled style={{ pointerEvents: 'none' }}>
                Show Me What Happened
              </Button>
            </span>
          </OverlayTrigger>
          <Button variant="success" onClick={props.onHide}>Play Again</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function accuse() {
    setModalShow(true)
  }

  function renderSinglePersonButtons(actor) {
    return <div className="vertical-row">
      <div/>
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
    return <div className="vertical-row">
      <div/>
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

  function replay() {
    setModalShow(false);
    actors = createActors();
    setSimulationState([])
    setLog([])
    setWitnessLog([])
    setGraph('')
    setAnswer(undefined)
    setDroppedActors([undefined, undefined])
    setSeed(randomSeed())
    resetGraphResources()
  }

  function isVictim(actor) {
    const rule = simulationState.filter(p => p.name == "dead" && p.actors[0] == actor)
    return rule.length > 0;
  }

  return <div>
    <AccuseModal
      show={modalShow}
      onHide={() => {setModalShow(false); replay()}}
    />
    <LoadingModal />
    <DndProvider backend={HTML5Backend}>
      <Container fluid={true} className="main">
        {actors != null ? <IdCards actors={actors} isVictim={(actor) => isVictim(actor)} /> : <div/>}
        <div className="horizontal-row wrap">
          <div>
            <p className="question-label">Ask...</p>
            <TargetArea index={0} onDrop={(actor) => setActor(actor, 0)} droppedActor={droppedActors[0]} isVictim={(actor) => isVictim(actor)} />
          </div>
          {droppedActors[0] != undefined && droppedActors[1] == undefined
            ? renderSinglePersonButtons(droppedActors[0])
            : <div></div>
          }
          {droppedActors[0] != undefined && droppedActors[1] != undefined
            ? renderTwoPersonButtons(droppedActors[0], droppedActors[1])
            : <div></div>
          }
          <div>
            <p className="question-label">...about...</p>
            <TargetArea index={1} onDrop={(actor) => setActor(actor, 1)} droppedActor={droppedActors[1]} isVictim={(actor) => isVictim(actor)} />
          </div>
        </div>
        <AnswerArea />
        {simulationState.length > 0 && <Graph dot={graph} />}
        {false && <div className="event-log">{log.map((item, i) => <div key={i}>{JSON.stringify(item)}</div>)}</div>}
      </Container>
    </DndProvider>
  </div>
}

ReactDOM.render(<App />, document.getElementById('app'))
