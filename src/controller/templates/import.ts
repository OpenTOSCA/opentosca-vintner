import {Template} from '#repository/templates'
import lock from '#utils/lock'
import * as validator from '#validator'

export type TemplatesCreateOptions = {template: string; path: string; gitRepository?: string; gitCheckout?: string}

export default async function (options: TemplatesCreateOptions) {
    const template = new Template(options.template)

    await lock.try(template.getLockKey(), async () => {
        validator.ensureName(template.getName())
        if (template.exists()) throw new Error(`Template ${options.template} already exists`)
        await template.create().importTemplate(options)
    })
}
