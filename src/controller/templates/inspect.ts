import {Template} from '#repository/templates'

export type TemplatesInspectOptions = {template: string}

export default async function (options: TemplatesInspectOptions) {
    const template = new Template(options.template)
    if (!template.exists()) throw new Error(`Template "${options.template}" does not exist`)
    return template.loadVariableServiceTemplate()
}
