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
}

export type TechnologyAssignmentRulesMap = {[technology: string]: TechnologyAssignmentRule[]}

export type TechnologyAssignmentRule = {
    component: string
    // Deprecated
    host?: string
    hosting?: string | string[]
    conditions?: LogicExpression | LogicExpression[]
    weight?: number
    assign?: string
    comment?: string
}
