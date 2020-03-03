import React  from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { PredicateArea } from './predicate-area'
import Range from 'rc-slider'
import 'rc-slider/assets/index.css'
import { Predicate } from '../models/predicates';
import { Actor } from '../models/actors'
import { Result } from '../models/result'

export const ResultSide: React.FC<{
        results: Result[],
        actors: Actor[],
        keptPredicates: Predicate[],
        addResult: () => void,
        updateProbabilites: (index: number, value: number) => void,
        updatePredicate: (pred: Predicate, result: Result) => void,
        removePredicate: (pred: Predicate, result: Result) => void,
        addPredicate: (pred: Predicate, result: Result) => void
    }> = ({results, actors, keptPredicates, addResult, updateProbabilites, updatePredicate, removePredicate, addPredicate}) => {

    function addButton() {
        return <Button
            className="add-result"
            onClick={addResult}>
        +
        </Button>
    }

    const percentages = [0.0, ...results.map((r, i) => results.slice(0, i + 1).reduce((sum, r) => sum + r.probability)), 1.0]

    return <div className="margin">
        <h2 className="title2">Result</h2>
        <Range
            onChange={values => {console.log(values);updateProbabilites(values.slice(1, values.length - 1))}}
            count={percentages.length + 2}
            pushable={0.01}
            max={1}
            min={0}
            step={0.01}
            value={percentages} />
        <div className="horizontal-row wrap">
            {results.map((result: Result, index: number) => <RuleResult
                    index={index}
                    result={result}
                    actors={actors}
                    keptPredicates={keptPredicates}
                    updatePredicateAtResult={updatePredicate}
                    removePredicateFromResult={removePredicate}
                    addPredicateToResult={addPredicate}>
            </RuleResult>)}
            {addButton()} 
        </div>
    </div>
}

const RuleResult: React.FC<{
        index: number,
        result: Result,
        actors: Actor[],
        keptPredicates: Predicate[],
        removePredicateFromResult: (pred: Predicate, result: Result) => void,
        addPredicateToResult: (pred: Predicate, result: Result) => void,
        updatePredicateAtResult: (pred: Predicate, result: Result) => void,
    }> = ({index, result, actors, keptPredicates, removePredicateFromResult, addPredicateToResult, updatePredicateAtResult}) => {

    const addPredicateWrapper = function(pred: Predicate) {
        addPredicateToResult(pred, result)
    }

    const removePredicateWrapper = function(pred: Predicate) {
        removePredicateFromResult(pred, result)
    }

    const updatePredicateWrapper = function(pred: Predicate) {
        updatePredicateAtResult(pred, result)
    }

    const reward_pairs = [
        {name: "Sanity", value: result.sanity},
        {name: "Fulfilment", value: result.fulfilment},
        {name: "Social", value: result.social}
    ];
    
    const probability_pairs = [
        {name: "Witnessing", value: result.witness_probability},
        {name: "Admitting", value: result.admit_probablity}
    ]

    function input(name: string, value: number) {
        return <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-sm">{name}</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                defaultValue={value}
                aria-label="Small"
                aria-describedby="inputGroup-sizing-sm"
                className="reward-input"
            />
        </InputGroup>
    }

    function title() {
        return <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Title</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                defaultValue={result.title}
                aria-label="Default"
                placeholder="e.g. success"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
    }

    function template() {
        return <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Templating String</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                defaultValue={result.template}
                as="textarea"
                aria-label="Default"
                placeholder="e.g. {0} lied to {1}"
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
    }

    return <div className="result">
        {title()}
        <PredicateArea
            isResultSide={true}
            actors={actors}
            predicates={result.predicates != null ? result.predicates : []}
            keptPredicates={keptPredicates}
            updatePredicate={(pred) => updatePredicateWrapper(pred)}
            removePredicate={(pred) => removePredicateWrapper(pred)}
            addPredicate={(pred) => addPredicateWrapper(pred)}>
        </PredicateArea>
        {template()}
        <h4 className="title4">Rewards</h4>
        <div className="input-row">
            {reward_pairs.map(p => input(p.name, p.value))}
        </div>
        <h4 className="title4">Probabilities</h4>
        <div className="input-row">
            {probability_pairs.map(p => input(p.name, p.value))}
        </div>
    </div>
}
