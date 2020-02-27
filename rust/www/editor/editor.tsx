import React, { useState } from 'react'

import { useDrag, DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Collapse from 'react-bootstrap/Collapse'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import { createActors, Actor, DraggedActor } from '../models/actors'
import { allPredicates, AbstractPredicate, Predicate } from '../models/predicates'
import { ResultSide } from './result';
import { PreconditionSide } from './preconditions'
import { DraggedPredicate } from './predicate-area'
import { Rule, parseRule } from '../models/rules'
import { murderMysteryRuleset } from '../murder_mystery'
import { ruleIconMapping } from '../emojis'

import { BsArrowCounterclockwise } from 'react-icons/bs'
import { Result } from '../models/result';
import { ViewOnlyResultSide } from './view-only-result';
import { Link } from 'react-router-dom';
import { arrayEquals } from '../helpers';


function AbstractPredicateDisplay({ abspred }) {
    const [{ isDragging }, drag] = useDrag<DraggedPredicate, AbstractPredicate, { isDragging: boolean }>({
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
    const [actors, setActors] = useState<Actor[]>(createActors())
    const [openNew, setOpenNew] = useState(false);
    const [openExplore, setOpenExplore] = useState(new Array(murderMysteryRuleset.rules.length).fill(false));

    const addResult = () => {
        let updatedResults = [...rule.results, new Result(0)]
        updateRule({ ...rule, results: updatedResults })
    }

    function updatePercentage(index: number, newProb: number) {
        const newPercentages = rule.results.map((rule) => rule.probability)
        newPercentages[index] = newProb

        //if we only have one option it has to be 100
        if (newPercentages.length == 1) return

        let sum = 0
        newPercentages.map(val => sum = sum + val)
        const overflow = sum - 1;
        const overflowPerResult = overflow / (newPercentages.length - 1)
        for (let i = 0; i < newPercentages.length; i++) {
            if (i == index) continue
            //FIXME: what if one turns to 0
            newPercentages[i] = newPercentages[i] - overflowPerResult
            if (newPercentages[i] < 0)  {
                console.log('Do something')
            }
        }
        let updatedResults = rule.results
        for (const [index, value] of newPercentages.entries()) {
            updatedResults[index].probability = value
        }
        updateRule({...rule, results: updatedResults})
    }

    const removePredicateFromLhs = (pred: Predicate) => {
        let updatePreconditions = rule.preconditions.filter((item) => !(item.abstract.name == pred.abstract.name && arrayEquals(item.actorsNums, pred.actorsNums)))
        updateRule({ ...rule, preconditions: updatePreconditions })
    }

    const addPredicateToLhs = (pred: Predicate) => {
        let updatedPreconditions = [...rule.preconditions, pred]
        updateRule({ ...rule, preconditions: updatedPreconditions })
    }

    const updatePredicateLhs = (pred: Predicate) => {
        updateRule({...rule})
    }

    const removePredicateFromResult = (pred: Predicate, result: Result) => {
        updateRule(rule => ({...rule, results: rule.results.map(r => r.template === result.template ? {...r, predicates: r.predicates.filter((p) => p !== pred)} : r)}))
    }

    const addPredicateToResult = (pred: Predicate, result: Result) => {
        updateRule(rule => ({...rule, results: rule.results.map(r => r.template === result.template ? {...r, predicates: [...r.predicates, pred]} : r)}))
    }

    const updatePredicateAtResult = (pred: Predicate, result: Result) => {
        updateRule({...rule})
    }

    const toggleOpen = (index: number) => {
        setOpenExplore(old => {
            const copy = [...old];
            copy[index] = !openExplore[index]
            return copy
        });
    }

    const RuleEditor: React.FC<{ editable: boolean, rule: Rule }> = ({ editable, rule }) => {
        return <div className="horizontal-row wrap" style={{ margin: "-1rem 0", padding: "0" }}>
            <PreconditionSide
                actors={actors}
                editable={editable}
                predicates={rule.preconditions}
                removePredicate={(pred) => removePredicateFromLhs(pred)}
                addPredicate={(pred) => addPredicateToLhs(pred)}
                updatePredicate={(pred) => updatePredicateLhs(pred)}
            >
            </PreconditionSide>
            {editable
                ? <ResultSide
                    actors={actors}
                    results={rule.results}
                    keptPredicates={rule.preconditions.filter((p) => p.keep)}
                    addResult={() => addResult()}
                    updateProbabilites={(index, value) => updatePercentage(index, value)}
                    updatePredicate={(pred, result) => updatePredicateAtResult(pred, result)}
                    addPredicate={(pred, result) => addPredicateToResult(pred, result)}
                    removePredicate={(pred, result) => removePredicateFromResult(pred, result)}>
                </ResultSide>
                : <ViewOnlyResultSide
                    actors={actors}
                    results={rule.results}
                    keptPredicates={rule.preconditions.filter((p) => p.keep)}
                >
                </ViewOnlyResultSide>
            }
        </div>
    }

    function cardForRule(rule: Rule, toggleOpen: any, open: boolean) {
        return <Card>
            <Card.Header onClick={() => toggleOpen()}>
                {ruleIconMapping[rule.name]}
                {" "}
                {rule.name}
            </Card.Header>
            <Collapse in={open}>
                <Card.Body>
                    <RuleEditor rule={rule} editable={false}></RuleEditor>
                </Card.Body>
            </Collapse>
        </Card>
    }

    return <DndProvider backend={HTML5Backend}>
        <div style={{ display: "flex" }}>
            <h1 style={{ margin: "1rem 2rem" }}>Editor</h1>
            <div style={{ flexGrow: 1 }}></div>
            <Link to="/" style={{ marginRight: "1rem", alignSelf: "center" }}>
                <Button>
                    Back to Game
                </Button>
            </Link>
        </div>
        <p className="intro-text">
            Here you can explore the rules that drive our simulation.
            Each rule consists of preconditions that need to be met and will result in one of the possible outcomes.
            Different rewards or penalties are then applied to the primary actor.

            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div style={{ display: "flex", flexDirection: "row", margin: "0 0 0 2rem" }}>
            <div>
                <div className="horizontal-row predicate-pick-area" style={{ flexWrap: "wrap", width: "200px" }}>
                    {allPredicates.map(pred => <AbstractPredicateDisplay abspred={pred}></AbstractPredicateDisplay>)}
                </div>
                <div className="horizontal-row actor-pick-area" style={{ flexWrap: "wrap", width: "200px", margin: "1rem 0" }}>
                    {actors.map(actor => <SimplifiedActor actor={actor}></SimplifiedActor>)}
                    <Button size="sm" onClick={() => setActors(createActors())}>
                        <BsArrowCounterclockwise size=""></BsArrowCounterclockwise>
                        New Actors
                    </Button>
                </div>
            </div>

            <div style={{ width: "100%", padding: "0 2rem 0 0" }}>
                <Card>
                    <Card.Header onClick={() => setOpenNew(!openNew)}>
                        New Rule
                    </Card.Header>
                    <Collapse in={openNew}>
                        <Card.Body>
                            <div className="horizontal-row">
                                <InputGroup className="mb-3" style={{ width: "35%", marginRight: "1rem" }}>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-default">Rule Icon</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        defaultValue={ruleIconMapping[rule]}
                                        aria-label="Default"
                                        placeholder="e.g. 🤥"
                                        aria-describedby="inputGroup-sizing-default"
                                    />
                                </InputGroup>
                                <InputGroup className="mb-3" style={{ marginRight: "1rem" }}>
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
                                <Link to="/" style={{ minWidth: "15%" }}>
                                    <Button>
                                        Save and Run Game
                                    </Button>
                                </Link>
                            </div>
                            <RuleEditor rule={rule} editable={true}></RuleEditor>
                        </Card.Body>
                    </Collapse>
                </Card>
                {murderMysteryRuleset.rules.map((rule, index) => cardForRule(parseRule(rule), () => toggleOpen(index), openExplore[index]))}
            </div>
        </div>
    </DndProvider>
}

const SimplifiedActor: React.FC<{ actor: Actor }> = ({ actor }) => {
    const [{ isDragging }, drag] = useDrag<DraggedActor, Actor, { isDragging: boolean }>({
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