import * as assert from '#assert'
import * as crypto from '#crypto'
import * as files from '#files'

export type TemplateVerifyOptions = {
    template: string
    signature?: string
    key: string
}

export default async function (options: TemplateVerifyOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.key, 'Key not defined')

    options.signature = options.signature ?? crypto.signatureFile(options.template)
    assert.isDefined(options.signature, 'Signature not defined')

    const key = files.loadFile(options.key)
    const verified = await crypto.verify({file: options.template, key, signature: options.signature})
    if (!verified) throw new Error(`Signature not valid`)
}
