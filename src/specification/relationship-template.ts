/**
 * Relationship Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_RELATIONSHIP_TEMPLATE}
 */
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'

export type RelationshipTemplate = {
    type: string
    properties?: PropertyAssignmentMap | PropertyAssignmentList
}

export type RelationshipTemplateMap = {[name: string]: RelationshipTemplate}
