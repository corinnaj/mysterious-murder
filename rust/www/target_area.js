import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState} from 'react'
import Button from 'react-bootstrap/Button';
import { useDrop } from 'react-dnd'
import { ActorProfile } from './id_cards';

export function TargetArea({ onDrop, isVictim, index, droppedActor }) {
    const [collectedProps, drop] = useDrop({
        accept: 'actor',
        drop: (item, monitor) => {
            onDrop(item.actor);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
        canDrop: (item, monitor) => {
            return !isVictim(item.actor) || index == 1;
        }
    })

    function renderCard() {
        return <div style={{display: "flex"}}>
            <ActorProfile actor={droppedActor} isVictim={isVictim(droppedActor)}></ActorProfile>
            <Button
                className="remove-button"
                variant="outline-danger"
                onClick={() => {onDrop(undefined)}}>
                ❌
            </Button>
        </div>
    }

    function renderText() {
        return <p className="margin">Drag Character here!</p>
    }

    return <div className="target-container" ref={drop} style={{background: collectedProps.isOver ? "#aaa" : "#eee"}}>
        {droppedActor != undefined ? renderCard() : renderText()}
    </div>
}