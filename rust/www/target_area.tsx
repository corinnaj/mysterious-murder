import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import Button from 'react-bootstrap/Button';
import { useDrop } from 'react-dnd'
import { ActorProfile } from './id_cards';
import { Actor, DraggedActor } from './actors';

export function TargetArea({ onDrop, isVictim, index, droppedActors }) {
    const [collectedProps, drop] = useDrop<DraggedActor, Actor, {isDragging: boolean}>({
        accept: 'actor',
        drop: (item, monitor) => {
            onDrop(item.actor)
            return item.actor
        },
        collect: monitor => ({
            isDragging: !monitor.isOver(),
        }),
        canDrop: (item, monitor) => {
            return (!isVictim(item.actor) || index == 1) && (item.actor !== droppedActors[index === 0 ? 1 : 0]);
        }
    })

    function renderCard() {
        return <div style={{ display: "flex" }}>
            <ActorProfile actor={droppedActors[index]} isVictim={isVictim(droppedActors[index])}></ActorProfile>
            <Button
                className="remove-button"
                variant="outline-danger"
                onClick={() => { onDrop(undefined) }}>
                ❌
            </Button>
        </div>
    }

    function renderText() {
        return <p className="margin">Drag Character here!</p>
    }

    return <div className="target-container" ref={drop} style={{background: !collectedProps.isDragging ? "#aaa" : "#eee"}}>
        {droppedActors[index] != undefined ? renderCard() : renderText()}
    </div>
}