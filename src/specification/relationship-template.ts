/**
 * Relationship Template
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ENTITY_RELATIONSHIP_TEMPLATE}
 */
import {PropertyAssignmentList, PropertyAssignmentMap} from '#spec/property-assignments'
import {ElementType} from '#spec/type-assignment'

export type RelationshipTemplate = {
    type: ElementType
    properties?: PropertyAssignmentMap | PropertyAssignmentList
}

export type RelationshipTemplateMap = {[name: string]: RelationshipTemplate}
