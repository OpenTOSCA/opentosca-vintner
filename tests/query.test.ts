import {expect} from 'chai'
import * as files from '../src/utils/files'
import path from 'path'
import runQuery from '../src/controller/query/run'
import resolveQueries from '../src/controller/template/query'
import {expectAsyncThrow} from './utils'

it(
    'all',
    getDefaultQueryTest('FROM templates/tests/query/service-template.yaml SELECT .', 'query/all/expected-output.yaml')
)

it(
    'array-access',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp.requirements[1]',
        'query/array-access/expected-output.yaml'
    )
)

it(
    'boolean-and',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[name="dbms" AND type="DBMS"]',
        'query/boolean-and/expected-output.yaml'
    )
)

it(
    'boolean-or',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[type="Database" OR type="DBMS"]',
        'query/boolean-or/expected-output.yaml'
    )
)

it(
    'filter-equals',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[type="VirtualMachine"].name',
        'query/filter-equals/expected-output.yaml'
    )
)

it(
    'filter-existence',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[properties.num_cpus].name',
        'query/filter-existence/expected-output.yaml'
    )
)

it(
    'filter-negation',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[!type="VirtualMachine"].name',
        'query/filter-negation/expected-output.yaml'
    )
)

it(
    'filter-nested',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[properties.port=3306]',
        'query/filter-nested/expected-output.yaml'
    )
)

it(
    'filter-regex',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[name=~"vm_"]',
        'query/filter-regex/expected-output.yaml'
    )
)

it(
    'group',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT GROUP(database_group)',
        'query/group/expected-output.yaml'
    )
)

it(
    'match-next',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="Tomcat"])-->(node) SELECT node',
        'query/match-next/expected-output.yaml'
    )
)

it(
    'match-previous',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml MATCH (node)<--([type="Tomcat"]) SELECT node',
        'query/match-previous/expected-output.yaml'
    )
)

it(
    'match-rel-filter',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml MATCH ()-{[type="ConnectsTo"]}->(node2) SELECT node2',
        'query/match-rel-filter/expected-output.yaml'
    )
)

it(
    'match-single',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml MATCH (node[type="WebApplication"]) SELECT node',
        'query/match-single/expected-output.yaml'
    )
)

it(
    'match-length-any',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="WebApplication"])-{*}->(node[type="OpenStack"]) SELECT node',
        'query/match-length-any/expected-output.yaml'
    )
)

it(
    'match-length-range',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="Tomcat"])-{*1..2}->(node) SELECT node.*.name',
        'query/match-length-range/expected-output.yaml'
    )
)

it(
    'node-template',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp',
        'query/node-template/expected-output.yaml'
    )
)

it(
    'policy',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT POLICY(placement_policy)',
        'query/policy/expected-output.yaml'
    )
)

it(
    'result-structure-simple',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp{name, type}',
        'query/result-structure-simple/expected-output.yaml'
    )
)

it(
    'result-structure-complex',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*{"Node Name": name, "Node Type": type}',
        'query/result-structure-complex/expected-output.yaml'
    )
)

it(
    'shortcut-property',
    getDefaultQueryTest(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp.#port',
        'query/shortcut-property/expected-output.yaml'
    )
)

it(
    'resolve-chain',
    getDefaultTemplateTest(
        'query/resolve-chain/service-template.yaml',
        'query/resolve-chain/expected-service-template.yaml'
    )
)

it('resolve-loop', async () => {
    await expectAsyncThrow(
        () => resolveTemplate('query/resolve-loop/service-template.yaml'),
        'Circular dependencies detected. Unable to resolve queries in your template.'
    )
})

it(
    'resolve-self',
    getDefaultTemplateTest(
        'query/resolve-self/service-template.yaml',
        'query/resolve-self/expected-service-template.yaml'
    )
)

it(
    'resolve-simple',
    getDefaultTemplateTest(
        'query/resolve-simple/service-template.yaml',
        'query/resolve-simple/expected-service-template.yaml'
    )
)

function getDefaultQueryTest(query: string, expected: string) {
    return async function () {
        const result = await runQuery({query, source: 'file'})
        expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, expected)))
    }
}

function getDefaultTemplateTest(template: string, expected: string) {
    return async function () {
        expect(files.loadYAML(await resolveTemplate(template))).to.deep.equal(
            files.loadYAML(path.join(__dirname, expected))
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
