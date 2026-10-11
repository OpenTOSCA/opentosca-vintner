import * as files from '#files'
import {WineryTemplatesRepository} from '#query/plugins/winery'
import {expect} from 'chai'
import path from 'path'

describe('query winery', () => {
    it('get templates', async () => {
        const home = files.temporaryDirent()
        const repository = path.join(home, 'repository')
        files.createDirectory(path.join(home, '.winery'))
        files.storeYAML(path.join(home, '.winery', 'winery.yml'), {repository: {repositoryRoot: repository}})

        for (const name of ['first', 'second']) {
            const dir = path.join(repository, 'servicetemplates', name)
            files.createDirectory(dir)
            files.storeYAML(path.join(dir, 'ServiceTemplate.tosca'), {
                tosca_definitions_version: 'tosca_simple_yaml_1_3',
            })
        }

        const original = process.env.HOME
        process.env.HOME = home
        try {
            const templates = await new WineryTemplatesRepository().getTemplates()
            expect(templates.map(it => it.name).sort()).to.deep.equal(['first', 'second'])
            expect(templates[0].template.tosca_definitions_version).to.equal('tosca_simple_yaml_1_3')
        } finally {
            process.env.HOME = original
        }
    })
})
