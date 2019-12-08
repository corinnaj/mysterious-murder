import { Actor } from "./actors";

export interface AbsPred {
    name: string,
    numActors: number
}

export class Pred {
    abstract: AbsPred
    actors: Actor[]
    amount: number
    keep: boolean
    permanent: boolean

    constructor(thingie: AbsPred) {
        this.abstract = thingie
        this.amount = 1
    } 
}

const happy = {name: "Happy", numActors: 1}
const sad = {name: "Sad", numActors: 1}
const anger = {name: "Anger", numActors: 2}
const trust = {name: "Anger", numActors: 2}
const married = {name: "Married", numActors: 2}
const related = {name: "Related", numActors: 2}
const dead = {name: "Dead", numActors: 1}
const alive = {name: "Alive", numActors: 1}
const has_weapon = {name: "Has A Weapon", numActors: 1}

export const allPredicates = [happy, sad, anger, trust, married, related, dead, alive, has_weapon];