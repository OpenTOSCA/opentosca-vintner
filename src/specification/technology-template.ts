import {
    LogicExpression,
    TechnologyDefaultConditionMode,
    VariabilityAlternative,
    VariabilityPointList,
} from '#spec/variability'

export type TechnologyAssignment = string | VariabilityPointList<TechnologyTemplate> | boolean

export type TechnologyTemplateMap = {[technology: string]: TechnologyTemplate}

export type TechnologyTemplate = VariabilityAlternative & {
    default_condition_mode?: TechnologyDefaultConditionMode
    weight?: number
    assign?: string
    prio?: number
    scenario?: string
}

export type TechnologyRule = {
    technology: string
    component: string
    artifact?: string
    hosting?: string[]
    conditions?: LogicExpression | LogicExpression[]
    weight?: number
    assign?: string
    reason?: string
}
