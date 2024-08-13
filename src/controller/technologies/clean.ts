import * as assert from '#assert'

export type TypesGenerateOptions = {lib: string}

// TODO: clean
export default async function (options: TypesGenerateOptions) {
    assert.isDefined(options.lib)
}
