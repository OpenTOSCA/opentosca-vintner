import {expect} from 'chai'
import * as files from '../../src/utils/files'
import path from 'path'
import runQuery from '../../src/controller/query/run'
import resolveQueries from '../../src/controller/template/query'
import {expectAsyncThrow} from '../utils'

it('all', getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT .'))

it(
    'array-access',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.webapp.requirements[1]')
)

it(
    'boolean-and',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.*[name="dbms" AND type="DBMS"]')
)

it(
    'boolean-or',
    getDefaultQueryTest(
        'FROM templates/tests/query/template.yaml SELECT node_templates.*[type="Database" OR type="DBMS"]'
    )
)

it(
    'filter-equals',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.*[type="VirtualMachine"].name')
)

it(
    'filter-existence',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.*[properties.num_cpus].name')
)

it(
    'filter-negation',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.*[!type="VirtualMachine"].name')
)

it(
    'filter-nested',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.*[properties.port=3306]')
)

it('filter-regex', getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.*[name=~"vm_"]'))

it('group', getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT GROUP(database_group)'))

it(
    'match-next',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml MATCH ([type="Tomcat"])-->(node) SELECT node')
)

it(
    'match-previous',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml MATCH (node)<--([type="Tomcat"]) SELECT node')
)

it(
    'match-rel-filter',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml MATCH ()-{[type="ConnectsTo"]}->(node2) SELECT node2')
)

it(
    'match-single',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml MATCH (node[type="WebApplication"]) SELECT node')
)

it(
    'match-length-any',
    getDefaultQueryTest(
        'FROM templates/tests/query/template.yaml MATCH ([type="WebApplication"])-{*}->(node[type="OpenStack"]) SELECT node'
    )
)

it(
    'match-length-range',
    getDefaultQueryTest(
        'FROM templates/tests/query/template.yaml MATCH ([type="Tomcat"])-{*1..2}->(node) SELECT node.*.name'
    )
)

it('node-template', getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.webapp'))

it('policy', getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT POLICY(placement_policy)'))

it(
    'result-structure-simple',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.webapp{name, type}')
)

it(
    'result-structure-complex',
    getDefaultQueryTest(
        'FROM templates/tests/query/template.yaml SELECT node_templates.*{"Node Name": name, "Node Type": type}'
    )
)

it(
    'shortcut-property',
    getDefaultQueryTest('FROM templates/tests/query/template.yaml SELECT node_templates.webapp.#port')
)

it('resolve-chain', getDefaultTemplateTest('resolve-chain/template.yaml'))

it('resolve-loop', async () => {
    await expectAsyncThrow(
        () => resolveTemplate('resolve-loop/template.yaml'),
        'Circular dependencies detected. Unable to resolve queries in your template.'
    )
})

it('resolve-self', getDefaultTemplateTest('resolve-self/template.yaml'))

it('resolve-simple', getDefaultTemplateTest('resolve-simple/template.yaml'))

function getDefaultQueryTest(query: string) {
    return async function () {
        //@ts-ignore
        const title = this.test.title

        const result = await runQuery({query, source: 'file'})
        expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, title, 'expected.yaml')))
    }
}

function getDefaultTemplateTest(template: string) {
    return async function () {
        //@ts-ignore
        const title = this.test.title

        expect(files.loadYAML(await resolveTemplate(template))).to.deep.equal(
            files.loadYAML(path.join(__dirname, title, 'expected.yaml'))
        )
    }
}

async function resolveTemplate(templatePath: string) {
    const output = files.temporaryFile()
    await resolveQueries({
        output,
        template: path.join(__dirname, templatePath),
    })
    return output
}
