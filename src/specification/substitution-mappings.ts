/**
 * Substitution Mappings
 * {@link search for "3.8.13 Substitution mapping" at https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html}
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
