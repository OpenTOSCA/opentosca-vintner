import Controller from '#controller'
import * as files from '#files'
import {expect} from 'chai'
import * as fs from 'fs'
import path from 'path'

describe('template implement', () => {
    it('rewrites generated implementations as yaml', async () => {
        const dir = files.temporaryDirent()
        fs.cpSync(path.join('examples', 'unfurl-technology---shop'), dir, {recursive: true})

        // Modify generated section to enforce that implementations are written again
        const file = path.join(dir, 'lib', 'shop.component.yaml')
        const original = files.loadFile(file)
        files.storeFile(file, original + '\n    # outdated\n')

        await Controller.template.implement({dir, orchestrator: 'unfurl'})

        expect(files.loadYAML<{tosca_definitions_version: string}>(file).tosca_definitions_version).to.equal(
            'tosca_simple_yaml_1_3'
        )
        expect(files.loadFile(file)).to.equal(original)
    }).timeout(60 * 1000)
})
