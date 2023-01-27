import {Template} from '#repository/templates'
import open from 'open'

export type TemplatesOpenArguments = {template: string}

export default async function (options: TemplatesOpenArguments) {
    await open(new Template(options.template).getTemplateDirectory())
}
