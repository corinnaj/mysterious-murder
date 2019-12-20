import React, { useState } from 'react'

import { useDrag, DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Dropdown from 'react-bootstrap/Dropdown';

import { createActors, Actor, DraggedActor } from '../actors';
import { allPredicates, AbstractPredicate, Predicate } from '../predicates';
import { ResultSide, Result } from './result';
import { PreconditionSide } from './preconditions';
import { DraggedPredicate } from './predicate-area';
import { Rule, parseRuleByName, parseRule } from '../rules';
import { murderMysteryRuleset } from '../murder_mystery';
import { Dirent } from 'fs';

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
    const [rule, updateRule] = useState<Rule>(new Rule())
    const actors = createActors();

    const addResult = () => {
        let updatedResults = rule.results
        updatedResults.push(new Result(0))

        let updatedRule = rule
        updatedRule.results = updatedResults
        updateRule(updatedRule)
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
        let updatedRule = rule
        let updatePreconditions = updatedRule.preconditions.filter((item) => item.abstract.name != pred.abstract.name)
        updatedRule.preconditions = updatePreconditions
        updateRule(updatedRule)
    }

    const addPredicateToRhs = (pred: Predicate) => {
        let updatedRule = rule
        updatedRule.preconditions.push(pred)
        updateRule(updatedRule)
    }

    const removePredicateFromResult = (pred: Predicate, result: Result) => {
        let updatedRule = rule
        updatedRule.results.find((res) => res == result).predicates.filter((item) => item.abstract.name != pred.abstract.name)
        updateRule(updatedRule)
    }

    const addPredicateToResult = (pred: Predicate, result: Result) => {
        let updatedRule = rule
        updatedRule.results.find((res) => res.template == result.template).predicates.push(pred)
        updateRule(updatedRule)
    }
    
    console.log(rule)

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

        <div className="horizontal-row" style={{}}>
            <div className="horizontal-row predicate-pick-area" style={{flexWrap: "wrap", minWidth: "400px"}}>
                {allPredicates.map(pred => <AbstractPredicateDisplay abspred={pred}></AbstractPredicateDisplay>)}
            </div> 
            <div className="horizontal-row actor-pick-area" style={{flexWrap: "wrap", minWidth: "200px"}}>
                {actors.map(actor => <SimplifiedActor actor={actor}></SimplifiedActor>)}
            </div>
        </div>

        <div className="horizontal-row wrap">
            <PreconditionSide
                predicates={rule.preconditions != null ? rule.preconditions : []}
                removePredicate={(pred) => removePredicateFromRhs(pred)}
                addPredicate={(pred) => addPredicateToRhs(pred)}
            > 
            </PreconditionSide>
            <ResultSide
                results={rule.results != null ? rule.results : [new Result(1)]}
                addResult={() => addResult()}
                updateProbabilites={(index, value) => updatePercentage(index, value)}
                addPredicate={(pred, result) => addPredicateToResult(pred, result)}
                removePredicate={(pred, result) => removePredicateFromResult(pred, result)}>
            </ResultSide>
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