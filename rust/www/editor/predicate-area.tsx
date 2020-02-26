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
    editable: boolean,
    actors: Actor[],
    updatePredicate: (predicate: Predicate) => void,
    removePredicate: (predicate: Predicate) => void,
    addPredicate: (predicate: Predicate) => void
}> = ({ isResultSide, predicates, keptPredicates, editable, actors, updatePredicate, removePredicate, addPredicate }) => {

    const [collectedProps, drop] = useDrop<DraggedPredicate, AbstractPredicate, { isDragging: boolean }>({
        accept: 'pred',
        drop: (item, monitor) => {
            addPredicate(new Predicate(item.abspred))
            return item.abspred
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
        canDrop: (item, monitor) => {
           return editable;
        }
    })

    function updateKeep(pred: Predicate, val: boolean) {
       pred.keep = val 
       console.log(val)
       updatePredicate(pred)
    }

    return editable
    ? <div ref={drop} className="predicate-area-editable">
        {predicates.map(pred => <PredicateDisplay
            pred={pred}
            actors={actors}
            handleRemove={() => removePredicate(pred)}
            setPredKeep={(val) => updateKeep(pred, val)}
            isResultSide={isResultSide}
            editable={editable}
        ></PredicateDisplay>)}
        {keptPredicates.map(pred => <KeptPredicateDisplay
            pred={pred}
            actors={actors}
        ></KeptPredicateDisplay>)}
    </div>
    : <div ref={drop} className="predicate-area">
        {predicates.map(pred => <PredicateDisplay
            pred={pred}
            actors={actors}
            handleRemove={() => removePredicate(pred)}
            setPredKeep={(_) => {}}
            isResultSide={isResultSide}
            editable={editable}
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
        areas.push(<ActorDropArea index={i} editable={false} initActor={actors[pred.actorsNums[i]]}></ActorDropArea>)
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
            setPredKeep: (arg0: boolean) => void,
            isResultSide: boolean,
            editable: boolean
        }> = ({ pred, actors, handleRemove, setPredKeep, isResultSide, editable }) => {
    let areas = []
    for (let i = 0; i < pred.abstract.numActors; i++) {
        areas.push(<ActorDropArea index={i} editable={editable} initActor={actors[pred.actorsNums[i]]}></ActorDropArea>)
    }

    function keepIndicator() {
        if (isResultSide) return
        if (!editable && pred.keep) {
            return <p style={{color: "green", fontWeight: "bold", marginTop: "0", marginBottom: "0"}}>will be kept</p>
        }
        if (editable && pred.keep) {
            return <OverlayTrigger
                key={1}
                placement="bottom"
                overlay={<Tooltip id="tooltip-keep">This predicate will be kept after the rule application.</Tooltip>}
            >
                <Button variant="success" onClick={() => setPredKeep(false)}> 
                    {<BsCheck/>}
                    keep
                </Button>
            </OverlayTrigger>
        }
        if (editable && !pred.keep) {
            return <OverlayTrigger
                key={1}
                placement="bottom"
                overlay={<Tooltip id="tooltip-keep">This predicate will not be kept after the rule application.</Tooltip>}
            >
                <Button variant="danger" onClick={() => setPredKeep(true)}> 
                    {<BsX/>} 
                    don't keep
                </Button>
            </OverlayTrigger>
        }
    }

    function permanentIndicator() {
        if (!isResultSide) return
        if (!editable && pred.permanent) {
            return <p style={{color: "red", fontWeight: "bold", marginTop: "0", marginBottom: "0"}}>permanent</p>
        } else if (!editable && !pred.permanent) {
            return
        } else {
            return pred.permanent ? 
            <OverlayTrigger
                key={0}
                placement="bottom"
                overlay={<Tooltip id="tooltip-permanent">This predicate is permanent and cannot be removed.</Tooltip>}
            >
                <Button variant="success">permanent</Button>
            </OverlayTrigger> :
            <OverlayTrigger
                key={0}
                placement="bottom"
                overlay={<Tooltip id="tooltip-permanent">This predicate is not permanent.</Tooltip>}
            >
                <Button variant="danger">not permanent</Button>
            </OverlayTrigger>
        }
    }

    function amountIndicator() {
        if (!editable) return pred.amount + "x "
        return <Form>
            <Form.Group>
                <Form.Control as="select">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                </Form.Control>
            </Form.Group>
        </Form>
    }

    return <div className="horizontal-row abs-pred">
        {amountIndicator()}
        {pred.abstract.name}
        {areas}
        {keepIndicator()}
        {permanentIndicator()}
        {editable ? <Button
            variant="outline-danger"
            onClick={handleRemove}>
            ❌
        </Button> : <div/>}
    </div>
}

const ActorDropArea: React.FC<{ index: number, editable: boolean, initActor: Actor }> = ({ index, editable, initActor }) => {
    const [actor, setActor] = useState<Actor>(initActor)
    const [collectedProps, drop] = useDrop<DraggedActor, Actor, { isDragging: boolean }>({
        accept: 'actor',
        drop: (item, monitor) => {
            setActor(item.actor)
            return item.actor
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
        canDrop: (item, monitor) => {
            return editable
        }
    })
    let icon = "👤"
    if (actor != null)
        icon = actor.icon
    return editable
    ? <div ref={drop} className="actor-drop-area-editable">
        {icon}
    </div>
    : <div ref={drop} className="actor-drop-area">
        {icon}
    </div>
}
