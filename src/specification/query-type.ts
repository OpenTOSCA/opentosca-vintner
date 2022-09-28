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
    nodes: NodeExpression[]
    relationships?: RelationshipExpression[]
}

export type NodeExpression = {
    type: 'Node'
    name?: string
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
    direction: 'left' | 'right' | 'both'
    variable?: string
    cardinality?: string
    predicate?: PredicateExpression
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
