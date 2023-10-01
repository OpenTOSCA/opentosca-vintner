/**
 * Import Definition
 * {@link https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/os/TOSCA-Simple-Profile-YAML-v1.3-os.html#DEFN_ELEMENT_IMPORT_DEF}
 */
import {LogicExpression} from '#spec/variability'

export type ImportDefinition = string | ExtendedImportDefinition

export type ExtendedImportDefinition = {
    file: string
    conditions?: LogicExpression | LogicExpression[]
}
