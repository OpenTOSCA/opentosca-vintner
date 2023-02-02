import {Template} from '#repository/templates'

export type TemplatesInspectOptions = {template: string}

export default async function (options: TemplatesInspectOptions) {
    return new Template(options.template).getVariableServiceTemplate()
}
