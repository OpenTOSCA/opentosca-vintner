import * as assert from '#assert'

export type TypesGenerateOptions = {template: string}

// TODO: generate types
export default async function (options: TypesGenerateOptions) {
    assert.isDefined(options.template)
}
