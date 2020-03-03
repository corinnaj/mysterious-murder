export interface AbstractPredicate {
    category: number,
    name: string,
    numActors: number
}

export class Predicate {
    abstract: AbstractPredicate
    actorsNums: number[]
    amount: number
    keep: boolean
    permanent: boolean

    constructor(abstract: AbstractPredicate) {
        this.abstract = abstract
        this.amount = 1
        this.actorsNums = new Array(abstract.numActors)
    } 

}

export function predicateToJson(predicate: Predicate) {
    return {
        keep: predicate.keep || false,
        permanent: predicate.permanent || false,
        signature: {
            name: predicate.abstract.name || "",
            actors: predicate.actorsNums || []
        }
    }
}

export enum categories {Relationship, Feeling, Traits, Possesions, State, Alignment}

//Plutchik
const joy = {category: categories.Feeling, name: "Joy", numActors: 1} as AbstractPredicate
const sadness = {category: categories.Feeling, name: "Sadness", numActors: 1} as AbstractPredicate
const anger = {category: categories.Feeling, name: "Anger", numActors: 2} as AbstractPredicate
const fear = {category: categories.Feeling, name: "Fear", numActors: 2} as AbstractPredicate
const trust = {category: categories.Feeling, name: "Trust", numActors: 2} as AbstractPredicate
const disgust = {category: categories.Feeling, name: "Disgust", numActors: 2} as AbstractPredicate

//Big Five
const cautious = {category: categories.Traits, name: "Cautious", numActors: 1} as AbstractPredicate
const curious = {category: categories.Traits, name: "Curious", numActors: 1} as AbstractPredicate
const spontaneous = {category: categories.Traits, name: "Spontaneous", numActors: 1} as AbstractPredicate
const disciplined = {category: categories.Traits, name: "Disciplined", numActors: 1} as AbstractPredicate
const confident = {category: categories.Traits, name: "Confident", numActors: 1} as AbstractPredicate
const insecure = {category: categories.Traits, name: "Insecure", numActors: 1} as AbstractPredicate
const extrovert = {category: categories.Traits, name: "Extrovert", numActors: 1} as AbstractPredicate
const introvert = {category: categories.Traits, name: "Introvert", numActors: 1} as AbstractPredicate
const trusting = {category: categories.Traits, name: "Trusting", numActors: 1} as AbstractPredicate
const suspicious = {category: categories.Traits, name: "Suspicious", numActors: 1} as AbstractPredicate

const married = {category: categories.Relationship, name: "Married", numActors: 2} as AbstractPredicate
const related = {category: categories.Relationship, name: "Related", numActors: 2} as AbstractPredicate
const not_related = {category: categories.Relationship, name: "Not Related", numActors: 2} as AbstractPredicate
const attraction = {category: categories.Relationship, name: "Attraction", numActors: 2} as AbstractPredicate
const lovers = {category: categories.Relationship, name: "Lovers", numActors: 2} as AbstractPredicate

const dead = {category: categories.State, name: "Dead", numActors: 1} as AbstractPredicate
const alive = {category: categories.State, name: "Alive", numActors: 1} as AbstractPredicate

const has_weapon = {category: categories.Possesions, name: "Has A Weapon", numActors: 1} as AbstractPredicate
const has_money = {category: categories.Possesions, name: "Has Money", numActors: 1} as AbstractPredicate
const debt = {category: categories.Possesions, name: "Debt", numActors: 1} as AbstractPredicate

const good = {category: categories.Alignment, name: "Good", numActors: 1} as AbstractPredicate
const neutral = {category: categories.Alignment, name: "Neutral", numActors: 1} as AbstractPredicate
const evil = {category: categories.Alignment, name: "Evil", numActors: 1} as AbstractPredicate

export const allPredicates = [joy, sadness, spontaneous, confident, anger,fear, trust, disgust, cautious, curious, disciplined, insecure, extrovert, introvert, trusting, suspicious, married, related, not_related, attraction, lovers, dead, alive, has_weapon, has_money, debt, good, neutral, evil];