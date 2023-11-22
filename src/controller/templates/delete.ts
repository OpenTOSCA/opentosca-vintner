import {Template} from '#repositories/templates'
import lock from '#utils/lock'

export type TemplatesDeleteOptions = {template: string}

export default async function (options: TemplatesDeleteOptions) {
    const template = new Template(options.template)
    await lock.try(template.getLockKey(), () => {
        template.delete()
    })
}
