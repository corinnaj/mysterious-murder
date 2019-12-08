import { getFullName } from 'local-names';
import { male, female } from "./emojis";
import { DragObjectWithType } from 'react-dnd';

export interface Actor {
  gender: string
  icon: string
  name: string
  age: number
  index: number
}

export interface DraggedActor extends DragObjectWithType {
    type: string
    actor: Actor
}

export const createActors = (): Actor[]  => {
  return [0, 1, 2, 3].map(index => {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    return ({
      gender: gender,
      icon: gender == 'male'
        ? male[Math.floor(Math.random() * male.length)]
        : female[Math.floor(Math.random() * female.length)],
      name: getFullName(gender),
      age: 32,
      index,
    });
  })
}