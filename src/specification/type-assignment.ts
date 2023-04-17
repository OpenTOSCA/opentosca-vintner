import {VariabilityAlternative, VariabilityPointList} from '#spec/variability'

export type TypeAssignment = VariabilityAlternative

export type ElementType = string | VariabilityPointList<TypeAssignment>
