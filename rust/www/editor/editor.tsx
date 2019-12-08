import React, { useState } from 'react'

import { useDrag, DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import { createActors, Actor, DraggedActor } from '../actors';
import { allPredicates, AbstractPredicate } from '../predicates';
import { ResultSide, Result } from './result';
import { PreconditionSide } from './preconditions';
import { DraggedPredicate } from './predicate-area';

function AbstractPredicateDisplay({abspred}) {
    const [{ isDragging }, drag] = useDrag<DraggedPredicate, AbstractPredicate, {isDragging: boolean}>({
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

    const addResult = () => {
        setResults(results => [...results, new Result()])
    }

    return <DndProvider backend={HTML5Backend}>
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
            <div className="horizontal-row actor-pick-area" style={{flexWrap: "wrap", minWidth: "200px"}}>
                <h3>Actors</h3>
                {actors.map(actor => <SimplifiedActor actor={actor}></SimplifiedActor>)}
            </div>
            <div className="horizontal-row predicate-pick-area" style={{flexWrap: "wrap", minWidth: "400px"}}>
                {allPredicates.map(pred => <AbstractPredicateDisplay abspred={pred}></AbstractPredicateDisplay>)}
            </div> 
        </div>

        <div className="horizontal-row wrap">
            <PreconditionSide></PreconditionSide>
            <ResultSide results={results} addResult={() => addResult()}></ResultSide>
        </div>
    </DndProvider>
}

const SimplifiedActor: React.FC<{actor: Actor}> = ({actor}) => {
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

export default Editor