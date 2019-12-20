import React, { useState } from "react";
import { Predicate, AbstractPredicate } from "../predicates";
import { useDrop, DragObjectWithType } from "react-dnd";
import Button from "react-bootstrap/Button";
import { Actor, DraggedActor } from "../actors";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

export const PredicateArea: React.FC<{
        isResultSide: boolean,
        predicates: Predicate[],
        removePredicate: (predicate: Predicate) => void,
        addPredicate: (predicate: Predicate) => void
    }> = ({isResultSide, predicates, removePredicate, addPredicate}) => {

    const [collectedProps, drop] = useDrop<DraggedPredicate, AbstractPredicate, {isDragging: boolean}>({
        accept: 'pred',
        drop: (item, monitor) => {
            addPredicate(new Predicate(item.abspred))
            return item.abspred
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
    })

    return <div ref={drop} className="predicate-area">
        {predicates.map(pred => <PredicateDisplay pred={pred} handleRemove={() => removePredicate(pred)} isResultSide={isResultSide}></PredicateDisplay>)}
    </div>
}

export interface DraggedPredicate extends DragObjectWithType {
    type: string
    abspred: AbstractPredicate
}

const PredicateDisplay: React.FC<{pred: Predicate, handleRemove: () => void, isResultSide: boolean}> = ({pred, handleRemove, isResultSide}) => {
    let areas = []
    for (let i = 0; i < pred.abstract.numActors; i++) {
        areas.push(<ActorDropArea index={i}></ActorDropArea>)
    }

    return <div className="horizontal-row abs-pred">
        {pred.amount + "x"}
        {pred.abstract.name}
        {areas}
        {isResultSide ? <div></div> : <OverlayTrigger
            key={1}
            placement="bottom"
            overlay={<Tooltip id="tooltip-keep">This predicate will be kept after the rule application.</Tooltip>}
            >
                <Button variant="secondary">keep</Button>
        </OverlayTrigger>}

        {isResultSide ? <OverlayTrigger
            key={0}
            placement="bottom"
            overlay={<Tooltip id="tooltip-permanent">This predicate is permanent and cannot be removed.</Tooltip>}
            >
                <Button variant="secondary">permanent</Button>
        </OverlayTrigger> : <div></div>}
        <Button
            variant="outline-danger"
            onClick={handleRemove}>
                ❌
        </Button>
    </div>
}

const ActorDropArea: React.FC<{index: number}> = ({index}) => {
    const [actor, setActor] = useState<Actor>()
    const [collectedProps, drop] = useDrop<DraggedActor, Actor, {isDragging: boolean}>({
        accept: 'actor',
        drop: (item, monitor) => {
            setActor(item.actor)
            return item.actor
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
    })
    let icon = "👤"
    if (actor != null)
        icon = actor.icon
    return <div ref={drop} className="actor-drop-area">
        {icon}
    </div>
}
