import {Template} from '#repository/templates'

export type TemplatesDeleteOptions = {template: string}

export default async function (options: TemplatesDeleteOptions) {
    new Template(options.template).delete()
}
