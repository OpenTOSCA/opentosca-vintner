/**
 * Relationship Type
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_RELATIONSHIP_TYPE}
 */
import {EntityType} from '#spec/entity-type'

export const RELATIONSHIP_TYPE_ROOT = 'tosca.relationship.Root'

export type RelationshipType = EntityType

export type RelationshipTypeMap = {[key: string]: RelationshipType}
