import React, { useState } from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import { PredicateArea } from './predicate-area'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

export class Result {
    probability: number
    title: string
    admit_probablity: number
    witness_probability: number
    sanity: number
    social: number
    fulfilment: number
    template: string
}

export const ResultSide: React.FC<{results: Result[], addResult: () => void}> = ({results, addResult}) => {
    const [percentages, setPercentages] = useState<number[]>([100])
    
    function addNewResult() {
        setPercentages(percentages => [...percentages, 0])
        addResult()
    }

    function updatePercentage(index: number, newProb: number) {
        const newPercentages = percentages.slice()
        newPercentages[index] = newProb
        
        //if we only have one option it has to be 100
        if (newPercentages.length == 1) return

        let sum = 0
        newPercentages.map(val => sum = sum + val)
        const overflow = sum - 100;
        const overflowPerResult = overflow / (newPercentages.length - 1)
        for (let i = 0; i < newPercentages.length; i++) {
            if (i == index) continue
            newPercentages[i] = newPercentages[i] - overflowPerResult
        }
        setPercentages(newPercentages)
    }

    return <div>
        <h2>Result</h2>
        <div className="horizontal-row wrap">
            {results.map((result: Result, index: number) => <RuleResult
                    index={index}
                    result={result}
                    onPercentageChange={(index: number, value: number) => updatePercentage(index, value)}
                    percentages={percentages}>
                </RuleResult>)}
            <Button
                className="add-result"
                onClick={addNewResult}>
            +
            </Button>
        </div>
    </div>
}

const RuleResult: React.FC<{index: number, result: Result, onPercentageChange: (index: number, value: number) => void, percentages: number[]}> = ({index, result, onPercentageChange, percentages}) => {
    return <div className="result">
        <Slider
            value={percentages[index]}
            onChange={(value) => onPercentageChange(index, value)}
            marks={{0: '0', 10: '10', 20: '20', 30: '30', 40: '40', 50: '50', 60: '60', 70: '70', 80: '80', 90: '90', 100: '100'}}>
        </Slider>
        <PredicateArea isResultSide={true}></PredicateArea>
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