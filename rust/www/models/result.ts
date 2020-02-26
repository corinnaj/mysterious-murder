import { Predicate } from "./predicates"

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
