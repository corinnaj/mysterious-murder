import { Predicate, predicateToJson } from "./predicates"

export class Result {
    probability: number
    title: string
    admit_probablity: number
    witness_probability: number
    sanity: number
    social: number
    fulfilment: number
    template: string
    predicates: Predicate[]

    constructor(probability: number) {
        this.probability = probability
        this.predicates = []
    } 

}

export function resultToJson(result: Result, numResults: number) {
    return {
        probability: (1.0 / numResults),
        title: result.title || "",
        admit_probability: result.admit_probablity || 0, 
        witness_probability: result.admit_probablity || 0,
        sanity: result.sanity || 0,
        social: result.social || 0,
        fulfilment: result.fulfilment || 0,
        template: result.template || "",
        predicates: result.predicates.map(p => predicateToJson(p)),
        reset_rewards: false,
    }
}