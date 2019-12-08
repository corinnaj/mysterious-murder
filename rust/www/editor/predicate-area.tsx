import React, { useState } from "react";
import { Predicate, AbstractPredicate } from "../predicates";
import { useDrop, DragObjectWithType } from "react-dnd";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Actor, DraggedActor } from "../actors";

export const PredicateArea: React.FC = () => {
    const [preds, setPreds] = useState<Predicate[]>([])
    const [collectedProps, drop] = useDrop<DraggedPredicate, AbstractPredicate, {isDragging: boolean}>({
        accept: 'pred',
        drop: (item, monitor) => {
            setPreds(preds => [...preds, new Predicate(item.abspred)])
            return item.abspred
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
    })
    const handleRemove = (pred: Predicate) => {
        setPreds(preds.filter(item => item.abstract != pred.abstract))
    }

    return <div ref={drop} className="predicate-area">
        {preds.map(pred => <PredicateDisplay pred={pred} handleRemove={() => handleRemove(pred)}></PredicateDisplay>)}
    </div>
}

export interface DraggedPredicate extends DragObjectWithType {
    type: string
    abspred: AbstractPredicate
}

//TODO fix any 
const PredicateDisplay: React.FC<{pred: Predicate, handleRemove: any}> = ({pred, handleRemove}) => {
    let areas = []
    for (let i = 0; i < pred.abstract.numActors; i++) {
        areas.push(<ActorDropArea index={i}></ActorDropArea>)
    }

    return <div className="horizontal-row abs-pred">
        {pred.amount + "x"}
        {pred.abstract.name}
        {areas}
        <Form.Check></Form.Check>
        {"permanent"}
        <Form.Check></Form.Check>
        {"keep"}
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
