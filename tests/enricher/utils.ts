import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import path from 'path'

export function EnricherTest(dir: string) {
    return it(dir, async () => {
        const output = files.temporary()
        await Controller.template.enrich({template: path.join(__dirname, dir, 'template.yaml'), output})
        const result = await files.loadYAML(path.join(output))
        console.log(output)
        console.log(result)

        expect(result).to.deep.equal(await files.loadYAML(path.join(__dirname, dir, 'expected.yaml')))
        //await files.removeFile(output)
    })
}
