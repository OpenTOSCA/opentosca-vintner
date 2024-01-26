import {
    LogicExpression,
    TechnologyDefaultConditionMode,
    VariabilityAlternative,
    VariabilityPointList,
} from '#spec/variability'

export type TechnologyAssignment = string | VariabilityPointList<TechnologyTemplate>

export type TechnologyTemplate = VariabilityAlternative & {default_condition_mode?: TechnologyDefaultConditionMode}

export type TechnologyAssignmentRulesMap = {[technoloy: string]: TechnologyAssignmentRule[]}

export type TechnologyAssignmentRule = {
    component: string
    host?: string
    conditions?: LogicExpression | LogicExpression[]
}
