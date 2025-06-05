export type CardinalityExpression = {
    min: number
    max: number
}

export type ConditionExpression = {
    type: 'Comparison' | 'Existence'
    negation: boolean
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
    a: object
    operator?: string
    b?: object
}

export type RelationshipExpression = {
    type: 'Relationship'
    direction: 'in' | 'out' | 'both'
    variable?: string
    cardinality?: CardinalityExpression
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
    type: 'Array' | 'Condition' | 'Group' | 'Policy' | 'Step'
    path?: string
    condition?: PredicateExpression
    index?: number
}

export type VariableExpression = {
    isString: boolean
    text: string
}
