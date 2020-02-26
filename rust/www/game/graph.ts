import { Actor } from "../models/actors";

const ignorePredicates = ['alive']

export interface Predicate {
  name: string
  actors: Actor[]
}
export interface RuleInvocation {
  name: string
  inputs: Predicate[]
  outputs: Predicate[]
  actors: Actor[]
}
export interface StoryStep extends RuleInvocation {
    story: string
}
export interface WitnessLog {
  rule: RuleInvocation
  witness: Actor
}

// given a predicate instance signature, e.g. `anger 0 1`, store the current index used for deduplication
let indexMap = {}
const nextIndex = (signature: string) => indexMap[signature] = !indexMap[signature] ? 1 : indexMap[signature] + 1
const newResource = (signature: string) => {
  const id = signature + '_' + nextIndex(signature)
  resourcesFor(signature).push(id)
  return id
}
// map predicate instances on a list of existing indices in the simulation state
let resourceMap = {}
const resourcesFor = (signature: string) => !resourceMap[signature]
  ? resourceMap[signature] = []
  : resourceMap[signature]

export const resetGraphResources = () => {
  indexMap = {}
  resourceMap = {}
}

let globId = 0
export function signatureForPredicateInstance(p: Predicate) {
  return p.name + p.actors.join('')
}

function emojisForPredicateInstance(actors: Actor[], p: Predicate) {
  return p.name + ' ' + p.actors.map(a => a.icon).join(' ')
}
export function graphFromAction({ inputs, outputs, name: actionName, actors: actionActors }: RuleInvocation, globalActors: Actor[]): string {
    const finalInputs = inputs.filter(i => !ignorePredicates.includes(i.name)).map(i => {
        const signature = signatureForPredicateInstance(i)
        let id = resourcesFor(signature).pop()
        if (id)
            return { id }
        id = signature + '_' + nextIndex(signature)
        return { id, node: `n${id} [label="${emojisForPredicateInstance(globalActors, i)}"]` }
    })
    const finalOutputs = outputs.filter(i => !ignorePredicates.includes(i.name)).map(i => {
        const signature = signatureForPredicateInstance(i)
        const id = newResource(signature)
        return { id, node: `n${id} [label="${emojisForPredicateInstance(globalActors, i)}"]` }
    })
    const actionId = ++globId;
    const fontSize = actionName.includes('murder') ? 32 : 16
    const actionNode = `n${actionId} [fillcolor=cyan, fontsize=${fontSize}, label="${actionName} ${actionActors.map(a => a.icon).join('')}"]`;

    return [
        ...finalInputs.map(i => i.node).filter(n => !!n),
        ...finalOutputs.map(i => i.node).filter(n => !!n),
        actionNode,
        ...finalInputs.map(i => `n${i.id} -> n${actionId}`),
        ...finalOutputs.map(i => `n${actionId} -> n${i.id}`)
    ].join(';\n') + ';\n'
}
