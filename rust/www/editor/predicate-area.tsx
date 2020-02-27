import React, { useState } from "react";
import { Predicate, AbstractPredicate } from "../models/predicates";
import { useDrop, DragObjectWithType } from "react-dnd";
import Button from "react-bootstrap/Button";
import { Actor, DraggedActor } from "../models/actors";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import { BsCheck, BsX } from 'react-icons/bs'
import Form from "react-bootstrap/Form";

export const PredicateArea: React.FC<{
    isResultSide: boolean,
    predicates: Predicate[],
    keptPredicates: Predicate[],
    actors: Actor[],
    updatePredicate: (predicate: Predicate) => void,
    removePredicate: (predicate: Predicate) => void,
    addPredicate: (predicate: Predicate) => void
}> = ({ isResultSide, predicates, keptPredicates, actors, updatePredicate, removePredicate, addPredicate }) => {

    const [collectedProps, drop] = useDrop<DraggedPredicate, AbstractPredicate, { isDragging: boolean }>({
        accept: 'pred',
        drop: (item, monitor) => {
            addPredicate(new Predicate(item.abspred))
            return item.abspred
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
    })

    return <div ref={drop} className="predicate-area-editable">
        {predicates.map(pred => <PredicateDisplay
            pred={pred}
            actors={actors}
            handleRemove={() => removePredicate(pred)}
            updatePredicate={() => updatePredicate(pred)}
            isResultSide={isResultSide}
        ></PredicateDisplay>)}
        {keptPredicates.map(pred => <KeptPredicateDisplay
            pred={pred}
            actors={actors}
        ></KeptPredicateDisplay>)}
    </div>
}

const KeptPredicateDisplay: React.FC<{
    pred: Predicate,
    actors: Actor[],
}> = ({pred, actors}) => {

    let areas = []
    for (let i = 0; i < pred.abstract.numActors; i++) {
        areas.push(<ActorDropArea index={i} initActor={actors[pred.actorsNums[i]]} updateActor={() => {}}></ActorDropArea>)
    }

    return <div className="horizontal-row abs-pred-kept">
        {pred.amount + "x "}
        {pred.abstract.name}
        {areas}
    </div>
}

export interface DraggedPredicate extends DragObjectWithType {
    type: string
    abspred: AbstractPredicate
}

const PredicateDisplay: React.FC<{
            pred: Predicate,
            actors: Actor[],
            handleRemove: () => void,
            updatePredicate: (pred: Predicate) => void,
            isResultSide: boolean,
        }> = ({ pred, actors, handleRemove, updatePredicate, isResultSide }) => {
    let areas = []
    for (let i = 0; i < pred.abstract.numActors; i++) {
        areas.push(<ActorDropArea
                index={i}
                initActor={actors[pred.actorsNums[i]]}
                updateActor={updateActor}>
            </ActorDropArea>
        )
    }

    function keepIndicator() {
        if (isResultSide) return
        if (pred.keep) {
            return <OverlayTrigger
                key={1}
                placement="bottom"
                overlay={<Tooltip id="tooltip-keep">This predicate will be kept after the rule application.</Tooltip>}
            >
                <Button variant="success" onClick={() => updateKeep(false)}> 
                    {<BsCheck/>}
                    keep
                </Button>
            </OverlayTrigger>
        }
        if (!pred.keep) {
            return <OverlayTrigger
                key={1}
                placement="bottom"
                overlay={<Tooltip id="tooltip-keep">This predicate will not be kept after the rule application.</Tooltip>}
            >
                <Button variant="danger" onClick={() => updateKeep(true)}> 
                    {<BsX/>} 
                    don't keep
                </Button>
            </OverlayTrigger>
        }
    }

    function permanentIndicator() {
        if (!isResultSide) return
        return pred.permanent ? 
        <OverlayTrigger
            key={0}
            placement="bottom"
            overlay={<Tooltip id="tooltip-permanent">This predicate is permanent and cannot be removed.</Tooltip>}
        >
            <Button
                variant="success"
                onClick={() => updatePermanent(false)}>
                    permanent
            </Button>
        </OverlayTrigger> :
        <OverlayTrigger
            key={0}
            placement="bottom"
            overlay={<Tooltip id="tooltip-permanent">This predicate is not permanent.</Tooltip>}
        >
            <Button
                variant="danger"
                onClick={() => updatePermanent(true)}>
                    not permanent
            </Button>
        </OverlayTrigger>
    }

    function updateAmount(val: number) {
        pred.amount = val
        updatePredicate(pred)
    }

    function amountIndicator() {
        return <Form>
            <Form.Group>
                <Form.Control
                    as="select"
                    defaultValue={pred.amount}
                    onChange={(event) => {updateAmount((event.target as any).value)}}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                </Form.Control>
            </Form.Group>
        </Form>
    }

    function updateKeep(val: boolean) {
       pred.keep = val 
       updatePredicate(pred)
    }

    function updatePermanent(val: boolean) {
        pred.permanent = val
        updatePredicate(pred)
    }

    function updateActor(index: number, val: number) {
        pred.actorsNums[index] = val
        updatePredicate(pred)
    }

    return <div className="horizontal-row abs-pred">
        {amountIndicator()}
        {pred.abstract.name}
        {areas}
        {keepIndicator()}
        {permanentIndicator()}
        <Button
            variant="outline-danger"
            onClick={handleRemove}>
            ❌
        </Button> 
    </div>
}

const ActorDropArea: React.FC<{ index: number, initActor: Actor, updateActor: (index: number, value: number) => void }> = ({ index, initActor, updateActor }) => {
    const [actor, setActor] = useState<Actor>(initActor)
    const [collectedProps, drop] = useDrop<DraggedActor, Actor, { isDragging: boolean }>({
        accept: 'actor',
        drop: (item, monitor) => {
            setActor(item.actor)
            updateActor(index, item.actor.index)
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
