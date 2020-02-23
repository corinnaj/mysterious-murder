import { Actor } from "./actors";

export interface AbstractPredicate {
    category: number,
    name: string,
    numActors: number
}

export class Predicate {
    abstract: AbstractPredicate
    actors: Actor[]
    actorsNums: number[]
    amount: number
    keep: boolean
    permanent: boolean

    constructor(abstract: AbstractPredicate) {
        this.abstract = abstract
        this.amount = 1
    } 
}

export enum categories {Relationship, Feeling, Possesions, State}

const happy = {category: categories.Feeling, name: "Happy", numActors: 1} as AbstractPredicate
const sad = {category: categories.Feeling, name: "Sad", numActors: 1} as AbstractPredicate
const anger = {category: categories.Relationship, name: "Anger", numActors: 2} as AbstractPredicate
const trust = {category: categories.Relationship, name: "Trust", numActors: 2} as AbstractPredicate
const married = {category: categories.Relationship, name: "Married", numActors: 2} as AbstractPredicate
const related = {category: categories.Relationship, name: "Related", numActors: 2} as AbstractPredicate
const dead = {category: categories.State, name: "Dead", numActors: 1} as AbstractPredicate
const alive = {category: categories.State, name: "Alive", numActors: 1} as AbstractPredicate
const has_weapon = {category: categories.Possesions, name: "Has A Weapon", numActors: 1} as AbstractPredicate
const has_money = {category: categories.Possesions, name: "Has Money", numActors: 1} as AbstractPredicate

export const allPredicates = [happy, sad, anger, trust, married, related, dead, alive, has_weapon, has_money];