import * as assert from '#assert'
import std from '#std'

export type STATE = string
export type ACTION = string
export type Transition = {from: STATE; via: ACTION; to: STATE}

export class StateMachine {
    readonly name: string
    private readonly transitions: Transition[]

    state: STATE

    constructor(name: string, initial: STATE, transitions: Transition[]) {
        this.name = name
        this.state = initial
        this.transitions = transitions
    }

    do(action: ACTION) {
        const transition = this.transitions.find(it => it.from === this.state && it.via === action)
        assert.isDefined(transition, `No transition from current state "${this.state}" via action "${action}"`)
        std.log(
            `Transition machine "${this.name}" state "${this.state}" to state "${transition.to}" via action "${action}"`
        )
        this.state = transition.to
        return this.state
    }
}
