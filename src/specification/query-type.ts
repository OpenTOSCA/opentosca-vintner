export type Expression = {
    type: string
    value?: string
    from: FromExpression
    match?: MatchExpression
    select: SelectExpression
}

export type FromExpression = {
    type: 'From'
    template: string
    instance?: string
}

export type MatchExpression = {
    type: 'Match'
    start: NodeExpression
    steps?: MatchStepExpression[]
}

export type MatchStepExpression = {
    type: 'MatchStep'
    relationship: RelationshipExpression
    target: NodeExpression
}

export type NodeExpression = {
    type: 'Node'
    name?: string
    nodeType?: string
    predicate?: PredicateExpression
}

export type PathExpression = {
    type: 'Path'
    steps: StepExpression[]
}

export type PredicateExpression = {
    type: 'Predicate'
    a: Object
    operator?: string
    b?: Object
}

export type RelationshipExpression = {
    type: 'Relationship'
    kind: string
    name: string
    value: string
}

export type SelectExpression = {
    type: 'Select'
    path: PathExpression[]
}

export type StepExpression = {
    type: 'Step' | 'Group' | 'Policy'
    path: string
    condition?: PredicateExpression
}

export type ConditionExpression = {
    type: 'Comparison' | 'Existence'
    variable: string
    operator?: string
    value?: string
}
