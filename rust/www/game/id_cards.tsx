import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import { useDrag } from 'react-dnd'
import { Actor, DraggedActor } from '../models/actors'

export const ActorProfile: React.FC<{isVictim: boolean, actor: Actor}> = ({ actor, isVictim }) => {
    const [{ isDragging }, drag] = useDrag<DraggedActor, Actor, {isDragging: boolean}>({
        item: { actor, type: 'actor' },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
        begin: monitor => ({ actor, type: 'actor' }),
    })

    return <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="actor-profile">
            <div className={(isVictim ? "actor-is-victim" : "") + " actor-icon emoji"}>{actor.icon}</div>
            <div>
                <div className="actor-stats">{actor.name}</div>
                {/*<div className="actor-stats">{actor.age}</div>*/}
                {/*state.filter(p => p.actors[0] == actor && iconMappings[p.name]).map((p, i) =>
                        <PredicateDisplay predicate={p} key={i}/>
                        )*/}
            </div>
        </div>
    </div>
}

export function IdCards({ actors, isVictim }) {
    return <div className="horizontal-row wrap">
        {actors.map(actor =>
            <ActorProfile key={actor.index} {...{actor}} isVictim={isVictim(actor)}/>
        )}
    </div>
}
