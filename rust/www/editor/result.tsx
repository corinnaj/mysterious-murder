import React  from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { PredicateArea } from './predicate-area'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { Predicate } from '../predicates';

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
        results: Result[],
        addResult: () => void,
        updateProbabilites: (index: number, value: number) => void,
        removePredicate: (pred: Predicate, result: Result) => void,
        addPredicate: (pred: Predicate, result: Result) => void
    }> = ({results, addResult, updateProbabilites, removePredicate, addPredicate}) => {

    return <div className="margin">
        <h2>Result</h2>
        <div className="horizontal-row wrap">
            {results.map((result: Result, index: number) => <RuleResult
                    index={index}
                    result={result}
                    onPercentageChange={(index: number, value: number) => updateProbabilites(index, value)}
                    removePredicateFromResult={removePredicate}
                    addPredicateToResult={addPredicate}>
            </RuleResult>)}
            <Button
                className="add-result"
                onClick={addResult}>
            +
            </Button>
        </div>
    </div>
}

const RuleResult: React.FC<{
        index: number,
        result: Result,
        onPercentageChange: (index: number, value: number) => void,
        removePredicateFromResult: (pred: Predicate, result: Result) => void,
        addPredicateToResult: (pred: Predicate, result: Result) => void,
    }> = ({index, result, onPercentageChange, removePredicateFromResult, addPredicateToResult}) => {

    const addPredicateWrapper = function(pred: Predicate) {
        addPredicateToResult(pred, result)
    }

    const removePredicateWrapper = function(pred: Predicate) {
        removePredicateFromResult(pred, result)
    }

    return <div className="result">
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
            predicates={result.predicates != null ? result.predicates : []}
            removePredicate={(pred) => removePredicateWrapper(pred)}
            addPredicate={(pred) => addPredicateWrapper(pred)}>
        </PredicateArea>
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
                defaultValue={result.template}
                as="textarea"
                aria-label="Default"
                placeholder="e.g. "
                aria-describedby="inputGroup-sizing-default"
            />
        </InputGroup>
        <h4>Rewards</h4>
        <div className="input-row">
            <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-sm">Sanity</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    defaultValue={result.sanity}
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    className="reward-input"
                />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-sm">Fulfilment</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    defaultValue={result.fulfilment}
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    className="reward-input"
                />
            </InputGroup>
            <InputGroup size="sm" className="mb-3" >
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-sm">Social</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    defaultValue={result.social}
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    className="reward-input"
                />
            </InputGroup>
            </div>
        <h4>Probabilities</h4>
        <div className="input-row">
            <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-sm">Admitting</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    defaultValue={result.admit_probablity}
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    className="prob-input"
                />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-sm">Witnessing</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    defaultValue={result.witness_probability}
                    aria-label="Small"
                    aria-describedby="inputGroup-sizing-sm"
                    className="prob-input"
                />
            </InputGroup>
        </div>
    </div>
}