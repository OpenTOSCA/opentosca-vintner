/**
 * Service Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc26969451}
 */
import {ImportDefinition} from '#spec/import-definition'
import {GroupType} from './group-type'
import {TopologyTemplate} from './topology-template'

export enum TOSCA_DEFINITIONS_VERSION {
    TOSCA_SIMPLE_YAML_1_3 = 'tosca_simple_yaml_1_3',
    TOSCA_VARIABILITY_1_0 = 'tosca_variability_1_0',
    TOSCA_VARIABILITY_1_0_RC_2 = 'tosca_variability_1_0_rc_2',
}

export type ServiceTemplate = {
    tosca_definitions_version: TOSCA_DEFINITIONS_VERSION
    imports?: ImportDefinition[]
    metadata?: {[key: string]: string}
    description?: string
    topology_template?: TopologyTemplate
    group_types?: {[key: string]: GroupType}
}
