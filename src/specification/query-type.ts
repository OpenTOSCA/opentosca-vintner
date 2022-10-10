export type ConditionExpression = {
    type: 'Comparison' | 'Existence'
    variable: string
    operator?: string
    value?: string
}

export type Expression = {
    type: string
    value?: string
    from: FromExpression
    match?: MatchExpression
    select: SelectExpression
}

export type FromExpression = {
    type: 'Instance' | 'Template'
    path: string
}

export type KeyValuePair = {
    key: VariableExpression
    value: VariableExpression
}

export type MatchExpression = {
    type: 'Match'
    nodes: NodeExpression[]
    relationships?: RelationshipExpression[]
}

export type NodeExpression = {
    type: 'Node'
    name: string | undefined
    predicate?: PredicateExpression
}

export type PathExpression = {
    type: 'Path'
    steps: StepExpression[]
    returnVal?: ReturnExpression
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
    cardinality?: number
    predicate?: PredicateExpression
}

export type ReturnExpression = {
    type: 'Return'
    keyValuePairs: KeyValuePair[]
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

export type VariableExpression = {
    isString: boolean
    text: string
}
