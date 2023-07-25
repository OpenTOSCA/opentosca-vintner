import * as assert from '#assert'
import {Template} from '#repository/templates'
import lock from '#utils/lock'

export type TemplatesCreateOptions = {template: string; path: string; gitRepository?: string; gitCheckout?: string}

export default async function (options: TemplatesCreateOptions) {
    const template = new Template(options.template)

    await lock.try(template.getLockKey(), async () => {
        assert.isName(template.getName())
        if (template.exists()) throw new Error(`Template ${options.template} already exists`)
        await template.create().importTemplate(options)
    })
}
