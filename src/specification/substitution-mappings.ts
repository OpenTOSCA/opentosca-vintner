/**
 * Substitution Mappings
 * {@link "3.8.13 Substitution mapping"}
 */

export type SubstitutionMappings = {
    node_type: string
    substitution_filter?: NodeFilter
    properties?: {[key: string]: [string]}
    capabilities?: {[key: string]: [string, string]}
    requirements?: {[key: string]: [string, string]}
}

export type NodeFilter = {
    properties?: {[key: string]: any}[]
}
