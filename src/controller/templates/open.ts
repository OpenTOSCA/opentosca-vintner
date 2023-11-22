import {Template} from '#repositories/templates'
import open from '#utils/open'

export type TemplatesOpenOptions = {template: string}

export default async function (options: TemplatesOpenOptions) {
    const template = new Template(options.template)
    if (!template.exists()) throw new Error(`Template "${options.template}" does not exist`)
    await open.file(template.getTemplateDirectory())
}
