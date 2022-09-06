export type Expression = {
    type: string
    value?: string
    from: FromExpression
    select: SelectExpression
}

export type FromExpression = {
    type: 'From'
    template: string
    instance?: string
}

export type SelectExpression = {
    type: 'Select'
    path: StepExpression[]
}

export type StepExpression = {
    type: 'Step'
    path: string
    condition?: ConditionExpression
}

export type ConditionExpression = {
    type: 'Condition'
    operator: string
    variable: string
    value: string
}
