/**
 * Operation Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_OPERATION_DEF}
 */

export type OperationDefinition = {[key: string]: any} | string | null

export type OperationDefinitionMap = {[key: string]: OperationDefinition}
