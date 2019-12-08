import React, { useState } from 'react'

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createActors, Actor, DraggedActor } from '../actors';
import { allPredicates, AbsPred, Pred } from '../predicates';
import { DragObjectWithType, useDrag, DndProvider, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

class Result {
    probability: number
    title: string
    admit_probablity: number
    witness_probability: number
    sanity: number
    social: number
    fulfilment: number
    template: string
}

export function PredicateArea() {
    const [preds, setPreds] = useState<Pred[]>([])
    const [collectedProps, drop] = useDrop<DraggedPredicate, AbsPred, {isDragging: boolean}>({
        accept: 'pred',
        drop: (item, monitor) => {
            setPreds(preds => [...preds, new Pred(item.abspred)])
            return item.abspred
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
    })
    return <div ref={drop} className="predicate-area">
        {preds.map(pred => <Predicate pred={pred}></Predicate>)}
    </div>
}

interface DraggedPredicate extends DragObjectWithType {
    type: string
    abspred: AbsPred
}

function ActorDropArea({index}) {
    console.log(index)
    const [actor, setActor] = useState<Actor>()
    const [collectedProps, drop] = useDrop<DraggedActor, Actor, {isDragging: boolean}>({
        accept: 'actor',
        drop: (item, monitor) => {
            setActor(item.actor)
            return item.actor
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
    })
    let icon = "👤"
    if (actor != null)
        icon = actor.icon
    return <div ref={drop} className="actor-drop-area">
        {icon}
    </div>
}

function Predicate({pred}) {
    let areas = []
    for (let i = 0; i < pred.abstract.numActors; i++) {
        areas.push(<ActorDropArea index={i}></ActorDropArea>)
    }

    return <div className="horizontal-row abs-pred">
        {pred.amount + "x "}
        {pred.abstract.name + " "}
        {areas}
        {"  "}
        <Form.Check></Form.Check>
        {"permanent  "}
        <Form.Check></Form.Check>
        {"keep"}
    </div>
}

function AbstractPredicate({abspred}) {
    const [{ isDragging }, drag] = useDrag<DraggedPredicate, AbsPred, {isDragging: boolean}>({
        item: { abspred, type: 'pred' },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
        begin: monitor => ({ abspred, type: 'pred' }),
    })

    return <div ref={drag} className="horizontal-row abs-pred">
        {abspred.name + " "}
        👤
        {abspred.numActors}
    </div>
}

function Editor() {
    const [results, setResults] = useState<Result[]>([new Result()])
    const actors = createActors();

    return <div>
    <DndProvider backend={HTML5Backend}>
        <h1>Editor</h1>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Rule Name</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                aria-label="Default"
                placeholder="e.g. lie"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>

        <div className="horizontal-row" style={{width: "max-content"}}>
            <div className="horizontal-row actor-pick-area" style={{flexWrap: "wrap", width: "200px"}}>
                <h3>Actors</h3>
                {actors.map(actor => <SimplifiedActor actor={actor}></SimplifiedActor>)}
            </div>
            <div className="horizontal-row predicate-pick-area" style={{flexWrap: "wrap", width: "400px"}}>
                {allPredicates.map(pred => <AbstractPredicate abspred={pred}></AbstractPredicate>)}
            </div> 
        </div>

        <div className="horizontal-row wrap">
            <div className="margin">
                <h2>Preconditions</h2>
                <PredicateArea></PredicateArea>
            </div>
            <div className="margin">
                <h2>Result</h2>
                <div className="horizontal-row wrap">
                    {results.map(result => <RuleResult result={result} ></RuleResult>)}
                    <Button
                        className="add-result"
                        onClick={() => setResults(results => [...results, new Result()])}>
                    +
                    </Button>
                </div>
            </div>
        </div>
        </DndProvider>
    </div>
}

function SimplifiedActor({actor}) {
    const [{ isDragging }, drag] = useDrag<DraggedActor, Actor, {isDragging: boolean}>({
        item: { actor, type: 'actor' },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
        begin: monitor => ({ actor, type: 'actor' }),
    })

    return <div ref={drag} className="simplified-actor">
        {actor.icon}
    </div>
}

function RuleResult({result}) {
    return <div className="result">
        <PredicateArea></PredicateArea>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Title</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                defaultValue={result.title}
                aria-label="Default"
                placeholder="e.g. "
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Templating String</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                as="textarea"
                aria-label="Default"
                placeholder="e.g. "
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <h4>Rewards</h4>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Sanity</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Fulfilment</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Social</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <h4>Probabilities</h4>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Admit Probability</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Witness Probability</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
    </div>
}

export default Editor