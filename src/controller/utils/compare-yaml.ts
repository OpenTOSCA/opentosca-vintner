import * as assert from '#assert'
import * as files from '#files'
import std from '#std'
import jsonDiff from 'json-diff'

export type UtilsCompareYAMLOptions = {
    first: string
    second: string
}

export default async function (options: UtilsCompareYAMLOptions) {
    assert.isDefined(options.first, 'First not defined')
    assert.isDefined(options.second, 'Second not defined')

    const first = files.loadYAML(options.first)
    const second = files.loadYAML(options.second)

    const diff = jsonDiff.diffString(first, second)
    if (diff) {
        std.log(diff)
        throw new Error(`Files differ`)
    }
}
