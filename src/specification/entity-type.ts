/**
 * Entity Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#_Toc454457753}
 */
import {Metadata} from '#spec/metadata'
import {PropertyDefinitionMap} from '#spec/node-type'

export const ENTITY_TYPE_ROOT = 'tosca.entity.Root'

export type EntityType = {
    derived_from?: string
    description?: string
    metadata?: Metadata
    properties?: PropertyDefinitionMap
    _loaded?: boolean
    _file?: string
}

export type EntityTypeMap = {[key: string]: EntityType}
