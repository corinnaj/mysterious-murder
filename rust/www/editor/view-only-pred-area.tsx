import React from "react";
import { Predicate } from "../models/predicates";
import { Actor } from "../models/actors";

export const ViewOnlyPredicateArea: React.FC<{
    isResultSide: boolean,
    predicates: Predicate[],
    keptPredicates: Predicate[],
    actors: Actor[],
}> = ({ isResultSide, predicates, keptPredicates, actors }) => {

    return  <div className="predicate-area">
        {predicates.map(pred => {
            let actorIcons = []
            for (let i = 0; i < pred.abstract.numActors; i++) {
                let icon = "👤"
                if (actors[pred.actorsNums[i]]) icon = actors[pred.actorsNums[i]].icon
                actorIcons.push(icon)
            }
            return <ViewOnlyPredicateDisplay
                pred={pred}
                actors={actorIcons}
                isResultSide={isResultSide}>
            </ViewOnlyPredicateDisplay>;
        })}
        {keptPredicates.map(pred => {
            let actorIcons = []
            for (let i = 0; i < pred.abstract.numActors; i++) {
                let icon = "👤"
                if (actors[pred.actorsNums[i]]) icon = actors[pred.actorsNums[i]].icon
                actorIcons.push(icon)
            }
            return <ViewOnlyKeptPredicateDisplay
                pred={pred}
                actors={actorIcons}>
            </ViewOnlyKeptPredicateDisplay>;
        })}
    </div>
}

const ViewOnlyKeptPredicateDisplay: React.FC<{
    pred: Predicate,
    actors: String[],
}> = ({pred, actors}) => {

    return <div className="horizontal-row abs-pred-kept">
        {pred.amount + "x "}
        {pred.abstract.name}
        {actors.map((actor) => <div className="actor-view-only">{actor}</div>)}
    </div>
}

const ViewOnlyPredicateDisplay: React.FC<{
            pred: Predicate,
            actors: String[],
            isResultSide: boolean,
        }> = ({ pred, actors, isResultSide }) => {

    function keepIndicator() {
        if (isResultSide) return
        if (pred.keep) {
            return <p style={{color: "green", fontWeight: "bold", marginTop: "0", marginBottom: "0"}}>will be kept</p>
        }
    }

    function permanentIndicator() {
        if (!isResultSide) return
        if (pred.permanent) {
            return <p style={{color: "red", fontWeight: "bold", marginTop: "0", marginBottom: "0"}}>permanent</p>
        }
    }

    return <div className="horizontal-row abs-pred">
        {pred.amount + "x "}
        {pred.abstract.name}
        {actors.map((actor) => <div className="actor-view-only">{actor}</div>)}
        {keepIndicator()}
        {permanentIndicator()}
    </div>
}