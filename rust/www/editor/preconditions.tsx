import React from "react"
import { PredicateArea } from "./predicate-area";

export function PreconditionSide() {
    return <div className="margin">
        <h2>Preconditions</h2>
        <PredicateArea isResultSide={false}></PredicateArea>
    </div>
}
