/**
 * Interface Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_INTERFACE_DEF}
 */

export type InterfaceDefinition = {
    operations: {[key: string]: OperationDefinition}
}

export type OperationDefinition = {}
