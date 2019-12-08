import React from "react"
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { PredicateArea } from "./predicate-area";

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
    return <div>
        <h2>Result</h2>
        <div className="horizontal-row wrap">
            {results.map((result: Result) => <RuleResult result={result} ></RuleResult>)}
            <Button
                className="add-result"
                onClick={addResult}>
            +
            </Button>
        </div>
    </div>
}

const RuleResult: React.FC<{result: Result}> = ({result}) => {
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