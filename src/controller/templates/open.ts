import {Template} from '#repository/templates'
import open from 'open'

export type TemplatesOpenOptions = {template: string}

export default async function (options: TemplatesOpenOptions) {
    await open(new Template(options.template).getTemplateDirectory())
}
