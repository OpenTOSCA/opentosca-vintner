import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import path from 'path'

export function EnricherTest(dir: string) {
    return it(dir, async () => {
        const output = files.temporaryDirent()
        await Controller.template.enrich({template: path.join(__dirname, dir, 'template.yaml'), output})
        const result = await files.loadYAML(path.join(output))
        expect(result).to.deep.equal(await files.loadYAML(path.join(__dirname, dir, 'expected.yaml')))
        await files.removeFile(output)
    })
}
