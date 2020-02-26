import React from "react"
import { PredicateArea } from "./predicate-area";
import { Predicate } from "../models/predicates";
import { Result } from "./result";
import { Actor } from "../models/actors";

export const PreconditionSide: React.FC<{
        editable: boolean,
        predicates: Predicate[],
        actors: Actor[],
        removePredicate: (pred: Predicate, result: Result) => void,
        addPredicate: (pred: Predicate, result: Result) => void
        updatePredicate: (pred: Predicate, result: Result) => void
    }> = ({editable, predicates, actors, removePredicate, addPredicate, updatePredicate}) => {

    const removePredicateWrapper = function(pred: Predicate) {
        removePredicate(pred, null)
    }

    const addPredicateWrapper = function(pred: Predicate) {
        addPredicate(pred, null)
    }

    const updatePredicateWrapper = function(pred: Predicate) {
        addPredicate(pred, null)
    }

    return <div className="margin">
        <h2>Preconditions</h2>
        <PredicateArea
            actors={actors}
            isResultSide={false}
            predicates={predicates}
            keptPredicates={[]}
            editable={editable}
            updatePredicate={(pred) => updatePredicateWrapper(pred)}
            removePredicate={(pred) => removePredicateWrapper(pred)}
            addPredicate={(pred) => addPredicateWrapper(pred)}>
        </PredicateArea>
    </div>
}
