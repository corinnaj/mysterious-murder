import React, { useState } from 'react'

import { useDrag, DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import Collapse from 'react-bootstrap/Collapse'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import { createActors, Actor, DraggedActor } from '../actors';
import { allPredicates, AbstractPredicate, Predicate } from '../predicates';
import { ResultSide, Result } from './result';
import { PreconditionSide } from './preconditions';
import { DraggedPredicate } from './predicate-area';
import { Rule, parseRule } from '../rules';
import { murderMysteryRuleset } from '../murder_mystery';

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
    const [rule, updateRule] = useState<Rule>(new Rule([new Result(1)]))
    const actors = createActors();

    const addResult = () => {
        let updatedResults = [...rule.results, new Result(0)]
        updateRule({...rule, results: updatedResults})
    }

    function updatePercentage(index: number, newProb: number) {
        const newPercentages = rule.results.map((rule) => rule.probability)
        newPercentages[index] = newProb
        
        //if we only have one option it has to be 100
        if (newPercentages.length == 1) return

        let sum = 0
        newPercentages.map(val => sum = sum + val)
        const overflow = sum - 100;
        const overflowPerResult = overflow / (newPercentages.length - 1)
        for (let i = 0; i < newPercentages.length; i++) {
            if (i == index) continue
            //FIXME: what if one turns to 0
            newPercentages[i] = newPercentages[i] - overflowPerResult
        }
        let updatedRule = rule
        for (const [index, value] of newPercentages.entries()) {
            updatedRule.results[index].probability = value
        }
        updateRule(updatedRule)
    }

    const removePredicateFromRhs = (pred: Predicate) => {
        let updatePreconditions = rule.preconditions.filter((item) => item.abstract.name != pred.abstract.name)
        updateRule({...rule, preconditions: updatePreconditions})
    }

    const addPredicateToRhs = (pred: Predicate) => {
        let updatedPreconditions = [...rule.preconditions, pred]
        updateRule({...rule, preconditions: updatedPreconditions})
    }

    const removePredicateFromResult = (pred: Predicate, result: Result) => {
        let r = rule.results.findIndex((res) => res == result)
        let updatedPredicated = rule.results[r].predicates.filter((item) => item.abstract.name != pred.abstract.name)
        //TODO
        let updatedResults = rule.results
        updateRule({...rule, results: updatedResults})
    }

    const addPredicateToResult = (pred: Predicate, result: Result) => {
        rule.results.find((res) => res.template == result.template).predicates.push(pred)
        let updatedPreconditions = [...rule.preconditions, pred]
        //updateRule({...rule, results: updatedResults})
    }

    const RuleEditor = function() {
        return <div>

            <div className="horizontal-row wrap">
                <PreconditionSide
                    predicates={rule.preconditions}
                    removePredicate={(pred) => removePredicateFromRhs(pred)}
                    addPredicate={(pred) => addPredicateToRhs(pred)}
                > 
                </PreconditionSide>
                <ResultSide
                    results={rule.results}
                    addResult={() => addResult()}
                    updateProbabilites={(index, value) => updatePercentage(index, value)}
                    addPredicate={(pred, result) => addPredicateToResult(pred, result)}
                    removePredicate={(pred, result) => removePredicateFromResult(pred, result)}>
                </ResultSide>
            </div>
        </div>
    }

    const [openNew, setOpenNew] = useState(false);
    const [openExplore, setOpenExplore] = useState(false);

    return <DndProvider backend={HTML5Backend}>
        <h1 style={{margin: "1rem 2rem"}}>Editor</h1>
        <p className="intro-text">
            Here you can explore the rules that drive our simulation.
            Each rule consists of preconditions that need to be met and will result in one of the possible outcomes.
            Different rewards or penalties are then applied to the primary actor.

            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div style={{display: "flex", flexDirection: "row"}}>
            <div className="">
                <div className="horizontal-row predicate-pick-area" style={{flexWrap: "wrap", width: "200px"}}>
                    {allPredicates.map(pred => <AbstractPredicateDisplay abspred={pred}></AbstractPredicateDisplay>)}
                </div> 
                <div className="horizontal-row actor-pick-area" style={{flexWrap: "wrap", width: "200px"}}>
                    {actors.map(actor => <SimplifiedActor actor={actor}></SimplifiedActor>)}
                </div>
            </div>

        <div>
        <Card>
            <Card.Header onClick={() => setOpenNew(!openNew)}>
                New Rule
            </Card.Header>
            <Collapse in={openNew}>
                <Card.Body>
                    <div className="pick-rule" style={{}}>
                        <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-default">Rule Name</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                defaultValue={rule.name}
                                aria-label="Default"
                                placeholder="e.g. lie"
                                aria-describedby="inputGroup-sizing-default"
                            />
                        </InputGroup>
                    </div>
                    <RuleEditor></RuleEditor>
                </Card.Body>
            </Collapse>
        </Card>
        <Card>
            <Card.Header onClick={() => setOpenExplore(!openExplore)}>
                Explore Existing Rules
            </Card.Header>
            <Collapse in={openExplore}>
                <Card.Body>
                    <div className="pick-rule" style={{}}>
                        <InputGroup className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-default">Rule Name</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                defaultValue={rule.name}
                                aria-label="Default"
                                placeholder="e.g. lie"
                                aria-describedby="inputGroup-sizing-default"
                            />
                        </InputGroup>
                        <Dropdown alignRight style={{marginLeft: "1rem"}}>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                Pick Rule
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {murderMysteryRuleset.rules.map((rule) => <Dropdown.Item onClick={() => updateRule(parseRule(rule))}>{rule.name}</Dropdown.Item>)}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <RuleEditor></RuleEditor>
                </Card.Body>
            </Collapse>
        </Card>
    </div>
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