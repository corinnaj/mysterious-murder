import React  from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { PredicateArea } from './predicate-area'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { Predicate } from '../models/predicates';
import { Actor } from '../models/actors'

export class Result {
    probability: number
    title: string
    admit_probablity: number
    witness_probability: number
    sanity: number
    social: number
    fulfilment: number
    template: string
    predicates: Predicate[]

    constructor(probability: number) {
        this.probability = probability
        this.predicates = []
    } 
}

export const ResultSide: React.FC<{
        editable: boolean,
        results: Result[],
        actors: Actor[],
        keptPredicates: Predicate[],
        addResult: () => void,
        updateProbabilites: (index: number, value: number) => void,
        removePredicate: (pred: Predicate, result: Result) => void,
        addPredicate: (pred: Predicate, result: Result) => void
    }> = ({editable, results, actors, keptPredicates, addResult, updateProbabilites, removePredicate, addPredicate}) => {


    function addButton() {
        return <Button
            className="add-result"
            onClick={addResult}>
        +
        </Button>
    }

    return <div className="margin">
        <h2>Result</h2>
        <div className="horizontal-row wrap">
            {results.map((result: Result, index: number) => <RuleResult
                    index={index}
                    result={result}
                    editable={editable}
                    actors={actors}
                    keptPredicates={keptPredicates}
                    onPercentageChange={(index: number, value: number) => updateProbabilites(index, value)}
                    removePredicateFromResult={removePredicate}
                    addPredicateToResult={addPredicate}>
            </RuleResult>)}
            {editable ? addButton() : <div/>}
        </div>
    </div>
}

const RuleResult: React.FC<{
        index: number,
        result: Result,
        editable: boolean,
        actors: Actor[],
        keptPredicates: Predicate[],
        onPercentageChange: (index: number, value: number) => void,
        removePredicateFromResult: (pred: Predicate, result: Result) => void,
        addPredicateToResult: (pred: Predicate, result: Result) => void,
    }> = ({index, result, editable, actors, keptPredicates, onPercentageChange, removePredicateFromResult, addPredicateToResult}) => {

    const addPredicateWrapper = function(pred: Predicate) {
        addPredicateToResult(pred, result)
    }

    const removePredicateWrapper = function(pred: Predicate) {
        removePredicateFromResult(pred, result)
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
        if (editable) {
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
        } else {
            return <p>
                <b>{name}:</b>
                {" "}
                {value ? value : "--"}
            </p>
        }
    }

    function title() {
        if (editable) {
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
        } else {
            return <p>
                <b>Title:</b>
                {" "}
                {result.title ? result.title : "--"}
            </p>
        }
    }

    function template() {
        if (editable) {
        return <InputGroup className="mb-3">
            <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-default">Templating String</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
                defaultValue={result.template}
                as="textarea"
                aria-label="Default"
                placeholder="e.g. "
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        } else {
            return <p>
                <b>Templating String:</b>
                {" "}
                {result.template ? result.template : "--"}
            </p>
        }

    }

    return <div className="result">
        {title()}
        <Slider
            className="slider"
            value={result.probability}
            max={1.0}
            step={0.01}
            onChange={(value) => onPercentageChange(index, value)}
            marks={{0: '0', 0.1: '10', 0.2: '20', 0.3: '30', 0.4: '40', 0.5: '50', 0.6: '60', 0.7: '70', 0.8: '80', 0.9: '90', 1: '100'}}>
        </Slider>
        <PredicateArea
            isResultSide={true}
            actors={actors}
            predicates={result.predicates != null ? result.predicates : []}
            keptPredicates={keptPredicates}
            updatePredicate={() => {}}
            editable={editable}
            removePredicate={(pred) => removePredicateWrapper(pred)}
            addPredicate={(pred) => addPredicateWrapper(pred)}>
        </PredicateArea>
        {template()}
        <h4>Rewards</h4>
        <div className="input-row">
            {reward_pairs.map(p => input(p.name, p.value))}
        </div>
        <h4>Probabilities</h4>
        <div className="input-row">
            {probability_pairs.map(p => input(p.name, p.value))}
        </div>
    </div>
}