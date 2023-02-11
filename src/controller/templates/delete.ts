import {Template} from '#repository/templates'
import {critical} from '#utils/lock'

export type TemplatesDeleteOptions = {template: string}

export default async function (options: TemplatesDeleteOptions) {
    const template = new Template(options.template)
    await critical(template.getLockKey(), () => {
        template.delete()
    })
}
