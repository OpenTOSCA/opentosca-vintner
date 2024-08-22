/**
 * Service Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969451}
 */
import {ArtifactTypeMap} from '#spec/artifact-type'
import {CapabilityTypeMap} from '#spec/capability-type'
import {DataTypeMap} from '#spec/data-type'
import {ImportDefinition} from '#spec/import-definition'
import {InterfaceTypeMap} from '#spec/interface-type'
import {Metadata} from '#spec/metadata'
import {NodeTypeMap} from '#spec/node-type'
import {PolicyTypeMap} from '#spec/policy-type'
import {RelationshipTypeMap} from '#spec/relationship-type'
import {GroupTypeMap} from './group-type'
import {TopologyTemplate} from './topology-template'

export enum TOSCA_DEFINITIONS_VERSION {
    TOSCA_SIMPLE_YAML_1_3 = 'tosca_simple_yaml_1_3',
    TOSCA_VARIABILITY_1_0 = 'tosca_variability_1_0',
    TOSCA_VARIABILITY_1_0_RC_1 = 'tosca_variability_1_0_rc_1',
    TOSCA_VARIABILITY_1_0_RC_2 = 'tosca_variability_1_0_rc_2',
    TOSCA_VARIABILITY_1_0_RC_3 = 'tosca_variability_1_0_rc_3',
}

export type ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION
    imports?: ImportDefinition[]
    metadata?: Metadata
    description?: string
    topology_template?: TopologyTemplate
} & EntityTypes

export type EntityTypes = {
    artifact_types?: ArtifactTypeMap
    data_types?: DataTypeMap
    capability_types?: CapabilityTypeMap
    interface_types?: InterfaceTypeMap
    relationship_types?: RelationshipTypeMap
    node_types?: NodeTypeMap
    group_types?: GroupTypeMap
    policy_types?: PolicyTypeMap
}

export const EntityTypesKeys: (keyof EntityTypes)[] = [
    'artifact_types',
    'data_types',
    'capability_types',
    'interface_types',
    'relationship_types',
    'node_types',
    'group_types',
    'policy_types',
]
