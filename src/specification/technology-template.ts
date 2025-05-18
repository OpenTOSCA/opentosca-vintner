import {
    LogicExpression,
    TechnologyDefaultConditionMode,
    VariabilityAlternative,
    VariabilityPointList,
} from '#spec/variability'
import {Scenario} from '#technologies/types'

export type TechnologyAssignment = string | VariabilityPointList<TechnologyTemplate> | boolean

export type TechnologyTemplateMap = {[technology: string]: TechnologyTemplate}

export type TechnologyTemplate = VariabilityAlternative & {
    default_condition_mode?: TechnologyDefaultConditionMode
    weight?: number
    assign?: string
    prio?: number
    scenario?: Scenario
}

export type TechnologyRule = {
    technology: string
    component: string
    operations?: string[]
    artifact?: string
    hosting?: string[]
    conditions?: LogicExpression | LogicExpression[]
    weight?: number
    assign?: string
    reason?: string
}
