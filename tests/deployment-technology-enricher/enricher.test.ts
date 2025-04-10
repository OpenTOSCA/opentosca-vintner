import Controller from '#controller'
import * as files from '#files'
import std from '#std'
import {expect} from 'chai'
import path from 'path'

describe('deployment technology enricher', () => {
    it('test', async () => {
        const output = files.temporaryDirent()
        await Controller.utils.selectTechnologies({
            template: path.join(__dirname, 'template.yaml'),
            output,
        })

        const result = await files.loadYAML(path.join(output))
        std.log(output)
        expect(result).to.deep.equal(await files.loadYAML(path.join(__dirname, 'expected.yaml')))
        await files.removeFile(output)
    })
})
