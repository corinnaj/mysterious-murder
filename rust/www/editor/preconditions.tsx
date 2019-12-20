import React from "react"
import { PredicateArea } from "./predicate-area";
import { Predicate } from "../predicates";
import { Result } from "./result";

export const PreconditionSide: React.FC<{
        predicates: Predicate[],
        removePredicate: (pred: Predicate, result: Result) => void,
        addPredicate: (pred: Predicate, result: Result) => void
    }> = ({predicates, removePredicate, addPredicate}) => {

    const removePredicateWrapper = function(pred: Predicate) {
        removePredicate(pred, null)
    }

    const addPredicateWrapper = function(pred: Predicate) {
        addPredicate(pred, null)
    }

    return <div className="margin">
        <h2>Preconditions</h2>
        <PredicateArea
            isResultSide={false}
            predicates={predicates}
            removePredicate={(pred) => removePredicateWrapper(pred)}
            addPredicate={(pred) => addPredicateWrapper(pred)}>
        </PredicateArea>
    </div>
}
