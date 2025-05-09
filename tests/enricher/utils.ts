import Controller from '#controller'
import * as files from '#files'
import std from '#std'
import {expect} from 'chai'
import jsonDiff from 'json-diff'
import path from 'path'

export function EnricherTest(dir: string) {
    return it(dir, async () => {
        const output = files.temporaryDirent()
        await Controller.template.enrich({template: path.join(__dirname, dir, 'template.yaml'), output})
        const result = await files.loadYAML(path.join(output))
        std.log(output)

        const expected = await files.loadYAML(path.join(__dirname, dir, 'expected.yaml'))
        const diff = jsonDiff.diffString(expected, result)
        if (diff) std.log(diff)
        expect(result).to.deep.equal(expected)

        await files.removeFile(output)
    })
}
