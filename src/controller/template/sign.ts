import * as assert from '#assert'
import * as crypto from '#crypto'
import * as files from '#files'

export type TemplateSignOptions = {
    template: string
    output?: string
    key: string
}

export default async function (options: TemplateSignOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.key, 'Key not defined')

    options.output = options.output ?? crypto.signatureFile(options.template)
    assert.isDefined(options.output, 'Output not defined')

    const key = files.loadFile(options.key)
    const signature = await crypto.sign({file: options.template, key})
    files.storeFile(options.output, signature)
}
