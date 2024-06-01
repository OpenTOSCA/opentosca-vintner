import * as assert from '#assert'

export type STATE = string
export type ACTION = string
export type Transition = {from: STATE; via: ACTION; to: STATE}

export class StateMachine {
    private readonly transitions: Transition[]

    state: STATE

    constructor(initial: STATE, transitions: Transition[]) {
        this.state = initial
        this.transitions = transitions
    }

    do(action: ACTION) {
        const transition = this.transitions.find(it => it.from === this.state && it.via === action)
        assert.isDefined(transition, `No transition from "${this.state}" via "${action}"`)
        this.state = transition.to
    }
}
