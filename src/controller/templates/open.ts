import {Template} from '#repository/templates'
import open from '#utils/open'

export type TemplatesOpenOptions = {template: string}

export default async function (options: TemplatesOpenOptions) {
    await open.file(new Template(options.template).getTemplateDirectory())
}
