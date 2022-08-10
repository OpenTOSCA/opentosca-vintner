import {Template} from '../../repository/templates'

export type TemplatesDeleteArguments = {template: string}

export default async function (options: TemplatesDeleteArguments) {
    new Template(options.template).delete()
}
