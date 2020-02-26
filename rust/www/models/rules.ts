import { murderMysteryRuleset } from "../murder_mystery";
import { Result } from "./result";
import { Predicate } from "./predicates";

export class Rule {
    results: Result[]
    preconditions: Predicate[] 
    name: string

    constructor(results?: Result[]) {
        this.preconditions = []
        this.results = results != null ? results : []
    }
}

export const parseAllRules = function () : Rule[] {
    const allRules = murderMysteryRuleset.rules;
    const allParsedRules = []
    for (let rule of allRules) {
        allParsedRules.push(parseRule(rule))
    }
    return allParsedRules

}

export const parseRuleByName = function (name: string) : Rule {
    let rulesByName = murderMysteryRuleset.rules.filter((r) => r.name == name)
    //TODO can I have more than one rule with a given name?
    return parseRule(rulesByName[0])
}

//TODO fix any
export const parseRule = function (rule: { name: any; lhs: any; rhs: any; }) : Rule {
    let r = new Rule()
    r.name = rule.name
    r.preconditions = []
    for (let con of rule.lhs) {
        const similars = r.preconditions.filter((p) =>
            {
                const array1 = con.signature.actors
                const array2 = p.actorsNums
                return con.signature.name == p.abstract.name &&
                    array1.length === array2.length && array1.every((value, index) => value === array2[index])
            })
        if (similars.length > 0) {
            similars[0].amount = similars[0].amount + 1
            break
        }
        r.preconditions.push(parsePredicate(con))
    }
    r.results = []
    for (let res of rule.rhs) {
        let newRes = new Result(res.probability)
        newRes.title = res.title
        newRes.admit_probablity = res.admit_probability
        newRes.fulfilment = res.fulfilment
        newRes.sanity = res.sanity
        newRes.social = res.social
        newRes.template = res.template
        newRes.witness_probability = res.witness_probability
        newRes.predicates = []
        for (let pred of res.predicates) {
            const similars = newRes.predicates.filter((p) =>
                {
                    const array1 = pred.signature.actors
                    const array2 = p.actorsNums
                    return pred.signature.name == p.abstract.name &&
                        array1.length === array2.length && array1.every((value, index) => value === array2[index])
                })
            if (similars.length > 0) {
                similars[0].amount = similars[0].amount + 1
                break
            }
            newRes.predicates.push(parsePredicate(pred))
        }
        r.results.push(newRes)
    }
    return r
}

function parsePredicate(con: { signature: {name: string, actors: number[]}; keep?: boolean; permanent?: boolean; }, ) {
    let predicate = new Predicate({name: con.signature.name, category: 0, numActors: con.signature.actors.length})
    predicate.amount = 1
    predicate.actorsNums = con.signature.actors
    predicate.keep = con.keep
    predicate.permanent = con.permanent
    return predicate
}