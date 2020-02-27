
import React, { useState, useEffect, useMemo, createRef } from 'react'
import Container from 'react-bootstrap/Container';
import { iconMappings, feelingIconMapping, objectIconMapping, moodIconMapping, relationshipIconMapping, ruleIconMapping } from '../emojis'
import { murderMysteryRuleset } from '../murder_mystery'
import { IdCards } from './id_cards'
import { TargetArea } from './target_area'
import * as d3 from 'd3'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { createActors, Actor } from '../models/actors';
import { RuleInvocation, Predicate, WitnessLog, graphFromAction, StoryStep, resetGraphResources } from './graph';
import {Link} from "react-router-dom";

let actors = createActors();

const readablePredicate = predicate => predicate.name.replace('_', ' ')

const RuleInvocationDisplay: React.FC<{ruleInvocation: RuleInvocation}> = ({ ruleInvocation }) => {
  return <div className="predicate emoji horizontal-row">
    <span key={ruleInvocation.actors[0].index} className="predicate-actor-icon">{ruleInvocation.actors[0].icon}</span>
      <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{readablePredicate(ruleInvocation)}</Tooltip>}>
        <span className="predicate-rule-icon">{iconMappings[ruleInvocation.name] || ruleInvocation.name}</span>
      </OverlayTrigger>
    {ruleInvocation.actors.slice(1).map(a => <span key={a.index} className="predicate-actor-icon">{a.icon}</span>)}
  </div>
}

const PredicatesDisplay: React.FC<{predicates: Predicate[]}> = ({predicates}) => {
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
  const ref = createRef<HTMLDivElement>()
  useEffect(() => {
    const el: any = d3.select(ref.current)
    el.graphviz({height, width: 600}).renderDot(`digraph {
      node [shape=box, margin=0.01, height=0, width=0, fontsize=7]; ${dot}}`)
    d3.select(ref.current).select('svg').attr('width', '100%')
  }, [dot])
  return <div style={{height: height + 'px', width: '100%'}} ref={ref} className="graph"></div>
}

function randomSeed(): number {
    return Math.floor(Math.random() * Math.pow(2, 32));
}

function App() {
  const [simulationState, setSimulationState] = useState<Predicate[]>([])
  const [log, setLog] = useState<StoryStep[]>([])
  const [witnessLog, setWitnessLog] = useState<WitnessLog[]>([])
  const [graph, setGraph] = useState('')
  const [answer, setAnswer] = useState<Predicate[]|RuleInvocation|undefined>(undefined)
  const [droppedActors, setDroppedActors] = useState<[Actor|undefined, Actor|undefined]>([undefined, undefined])
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState<number>(() => randomSeed());

  useEffect(() => {
    setAnswer(null)
  }, [droppedActors[0], droppedActors[1]])

  function AnswerArea() {
    if (!answer)
      return <></>
    if (Array.isArray(answer) && answer.length < 1)
      return <p className="horizontal-row bigger-font">None to speak of</p>

    return Array.isArray(answer)
      ? <PredicatesDisplay predicates={answer} />
      : <RuleInvocationDisplay ruleInvocation={answer} />
  }

  function witness(rule: RuleInvocation) {
    if (Math.random() < 0.5) {
      const possibleWitnesses = (actors.filter(a => !rule.actors.includes(a)));
      const witness = possibleWitnesses[Math.floor(Math.random() * possibleWitnesses.length)];
      setWitnessLog(witnessLog => [...witnessLog, {rule: rule, witness: witness}])
    }
  }

  const fillTemplate = (actorMapping: number[], actors: Actor[], template: string) => {
    return actorMapping.map(index => actors[index]).reduce((currentTemplate, actor, index) =>
      currentTemplate
        .replace(`{${index}}`, actor.name)
        .replace(new RegExp(`\\[${index}:([^|]+)\\|([^\\]]+)\\]`),
          actor.gender === 'female' ? '$2' : '$1'), template)
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
        const action = {...data, actors: data.actors.map(index => actors[index])} as RuleInvocation
        setLog(log => [...log, {...action, story: fillTemplate(data.actors, actors, data.template)}])
        witness(action)
        setGraph(graph => graph + graphFromAction(action, actors))
      } else if (data.type == 'abort') {
        replay();
      } else if (data.type == 'state') {
        setSimulationState(state => data.state.map(p => ({...p, actors: p.actors.map((index: number) => actors[index])})))
        setLoading(false)
      }
    })
  }, [seed])

  function askQuestion(actors: Actor[], predNames: string[]): Predicate[] {
    let allPreds = simulationState.filter(p => p.actors[0] === actors[0] && iconMappings[p.name] && predNames.includes(p.name))
    allPreds = actors[1] != undefined ? allPreds.filter(p => p.actors[1] === actors[1]) : allPreds
    if (allPreds.length == 0) return undefined
    return allPreds
  }

  function askWitnessQuestion(actors: Actor[], predNames: string[]): RuleInvocation {
      let allRules = witnessLog.filter(p => p.witness == actors[0] && p.rule.actors.includes(actors[1]))
      return allRules[Math.floor(Math.random() * allRules.length)].rule
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
    const [showGraph, setShowGraph] = useState(false)
    const [showLog, setShowLog] = useState(false)
    const rule = log[log.length - 1];
    const actor = droppedActors[0];
    if (!rule || !actor || !rule.actors || rule.actors.length < 1)
      return <div></div>
    const correct = rule.actors[0] === actor;
    const murderer = rule.actors[0]

    const stringLog = useMemo(() => JSON.stringify({actors, log}, null, 2), [log])

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="modal-title"
        dialogClassName={showGraph ? 'modal-90w' : ''}
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
          {showGraph && <Graph dot={graph} />}
          {showLog && <textarea readOnly className="story-log-json" value={stringLog} />}
        </Modal.Body>
        <Modal.Footer className="opposite">
          <span className="d-inline-block">
            <Button style={{marginRight: '1rem'}} onClick={() => setShowGraph(true)}>
              Show Me What Happened
            </Button>
            <Button onClick={() => setShowLog(true)}>
              Story as JSON
            </Button>
          </span>
          <Button variant="success" onClick={props.onHide}>Play Again</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function accuse() {
    setModalShow(true)
  }

  function renderSinglePersonButtons(actor: Actor) {
    return <div className="vertical-row">
      <div/>
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor], Object.keys(objectIconMapping)))}>
        Possessions
      </Button>
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor], Object.keys(moodIconMapping)))}>
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
        onClick={() => setAnswer(askQuestion([actor1, actor2], Object.keys(relationshipIconMapping)))}>
        Relationship
      </Button>
      <Button
        className="question-button"
        onClick={() => setAnswer(askQuestion([actor1, actor2], Object.keys(feelingIconMapping)))}>
        Feelings
      </Button>
      <Button
        className="question-button"
        onClick={() => setAnswer(askWitnessQuestion([actor1, actor2], Object.keys(ruleIconMapping)))}>
        Facts
      </Button>
    </div>
  }

  function setActor(actor: Actor, index: number) {
    setDroppedActors(a => a.map((a, i) => index === i ? actor : a) as [Actor, Actor])
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

  function isVictim(actor: Actor) {
    const rule = simulationState.filter(p => p.name == "dead" && p.actors[0] == actor)
    return rule.length > 0;
  }

  return <div className="body">
    <div className="content">
    <AccuseModal
      show={modalShow}
      onHide={() => {setModalShow(false); replay()}}
    />
    <LoadingModal />
      <Container fluid={true} className="main">
        {actors != null ? <IdCards actors={actors} isVictim={(actor: Actor) => isVictim(actor)} /> : <div/>}
        <div className="horizontal-row wrap">
          <div>
            <p className="question-label">Ask...</p>
            <TargetArea index={0} onDrop={(actor: Actor) => setActor(actor, 0)} droppedActors={droppedActors} isVictim={(actor: Actor) => isVictim(actor)} />
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
            <TargetArea index={1} onDrop={(actor: Actor) => setActor(actor, 1)} droppedActors={droppedActors} isVictim={(actor) => isVictim(actor)} />
          </div>
        </div>
        <AnswerArea />
        {false && <div className="event-log">{log.map((item, i) => <div key={i}>{JSON.stringify(item)}</div>)}</div>}
      </Container>
    </div>
      <footer className="footer horizontal-row">
        <p className="footer-text">
          We hope you enjoyed our game! It's open source project, you can find the code and get in touch with us via <a href="https://github.com/corinnaj/mysterious-murder">GitHub</a>.
          This web version is still a work in progress, if you are interested in updates you can subscribe to our <a href="https://twitter.com/sorcerless">Twitter.</a>
        </p>
        <Link to="/editor">
          <Button style={{margin: "1rem"}}>Take a look inside!</Button>
        </Link>
      </footer>
  </div>
}

export default App
