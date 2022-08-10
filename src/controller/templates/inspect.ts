import {Template} from '../../repository/templates'

export type TemplatesInspectArguments = {template: string}

export default async function (options: TemplatesInspectArguments) {
    return new Template(options.template).getVariableServiceTemplate()
}
