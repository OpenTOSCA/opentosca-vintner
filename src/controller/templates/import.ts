import {Template} from '#repository/templates'

export type TemplatesCreateArguments = {template: string; path: string}

export default async function (options: TemplatesCreateArguments) {
    const template = new Template(options.template)
    if (template.exists()) throw new Error(`Template ${options.template} already exists`)
    await template.create().importTemplate(options.path)
}
