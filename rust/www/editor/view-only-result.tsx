import React  from 'react'
import { Predicate } from '../models/predicates';
import { Actor } from '../models/actors'
import { Result } from '../models/result'
import { ViewOnlyPredicateArea } from './view-only-pred-area'

import ProgressBar from 'react-bootstrap/ProgressBar'

export const ViewOnlyResultSide: React.FC<{
        results: Result[],
        actors: Actor[],
        keptPredicates: Predicate[],
    }> = ({results, actors, keptPredicates}) => {

    return <div className="margin">
        <h2 className="title2">Result</h2>
        <div className="horizontal-row wrap">
            {results.map((result: Result) => <ViewOnlyRuleResult
                    result={result}
                    actors={actors}
                    keptPredicates={keptPredicates}>
            </ViewOnlyRuleResult>)}
        </div>
    </div>
}

const ViewOnlyRuleResult: React.FC<{
        result: Result,
        actors: Actor[],
        keptPredicates: Predicate[],
    }> = ({result, actors, keptPredicates }) => {

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
        return <p>
            <b>{name}:</b>
            {" "}
            {value ? value : "--"}
        </p>
    }

    function title() {
        return <p>
            <b>Title:</b>
            {" "}
            {result.title ? result.title : "--"}
        </p>
    }

    function template() {
        return <p>
            <b>Templating String:</b>
            {" "}
            {result.template ? result.template : "--"}
        </p>
    }

    function percentageBar() {
        const value = result.probability * 100
        return <ProgressBar now={value} label={`${value}%`} />
    }

    return <div className="result">
        {title()}
        {percentageBar()}
        <ViewOnlyPredicateArea
            isResultSide={true}
            actors={actors}
            predicates={result.predicates != null ? result.predicates : []}
            keptPredicates={keptPredicates}>
        </ViewOnlyPredicateArea>
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