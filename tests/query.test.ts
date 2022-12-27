import {expect} from 'chai'
import * as files from '../src/utils/files'
import path from 'path'
import runQuery from '../src/controller/query/run'
import resolveQueries from '../src/controller/template/query'
import {expectAsyncThrow} from './utils'

it('all', async () => {
    const result = await getResult('FROM templates/tests/query/service-template.yaml SELECT .')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/all/expected-output.yaml')))
})

it('array-access', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp.requirements[1]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/array-access/expected-output.yaml')))
})

it('boolean-and', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[name="dbms" AND type="DBMS"]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/boolean-and/expected-output.yaml')))
})

it('boolean-or', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[type="Database" OR type="DBMS"]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/boolean-or/expected-output.yaml')))
})

it('filter-equals', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[type="VirtualMachine"].name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-equals/expected-output.yaml')))
})

it('filter-existence', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[properties.num_cpus].name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-existence/expected-output.yaml')))
})

it('filter-negation', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[!type="VirtualMachine"].name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-negation/expected-output.yaml')))
})

it('filter-nested', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[properties.port=3306]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-nested/expected-output.yaml')))
})

it('filter-regex', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[name=~"vm_"]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-regex/expected-output.yaml')))
})

it('group', async () => {
    const result = await getResult('FROM templates/tests/query/service-template.yaml SELECT GROUP(database_group)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/group/expected-output.yaml')))
})

it('match-next', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="Tomcat"])-->(node) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-next/expected-output.yaml')))
})

it('match-previous', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml MATCH (node)<--([type="Tomcat"]) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-previous/expected-output.yaml')))
})

it('match-rel-filter', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ()-{[type="ConnectsTo"]}->(node2) SELECT node2'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-rel-filter/expected-output.yaml')))
})

it('match-single', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml MATCH (node[type="WebApplication"]) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-single/expected-output.yaml')))
})

it('match-length-any', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="WebApplication"])-{*}->(node[type="OpenStack"]) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-length-any/expected-output.yaml')))
})

it('match-length-range', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="Tomcat"])-{*1..2}->(node) SELECT node.*.name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-length-range/expected-output.yaml')))
})

it('node-template', async () => {
    const result = await getResult('FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/node-template/expected-output.yaml')))
})

it('policy', async () => {
    const result = await getResult('FROM templates/tests/query/service-template.yaml SELECT POLICY(placement_policy)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/policy/expected-output.yaml')))
})

it('result-structure-simple', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp{name, type}'
    )
    expect(result).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/result-structure-simple/expected-output.yaml'))
    )
})

it('result-structure-complex', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*{"Node Name": name, "Node Type": type}'
    )
    expect(result).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/result-structure-complex/expected-output.yaml'))
    )
})

it('shortcut-property', async () => {
    const result = await getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp.#port'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/shortcut-property/expected-output.yaml')))
})

it('resolve-chain', async () => {
    expect(files.loadYAML(await resolveTemplate('query/resolve-chain/service-template.yaml'))).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/resolve-chain/expected-service-template.yaml'))
    )
})

it('resolve-loop', async () => {
    await expectAsyncThrow(
        () => resolveTemplate('query/resolve-loop/service-template.yaml'),
        'Circular dependencies detected. Unable to resolve queries in your template.'
    )
})

it('resolve-self', async () => {
    expect(files.loadYAML(await resolveTemplate('query/resolve-self/service-template.yaml'))).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/resolve-self/expected-service-template.yaml'))
    )
})

it('resolve-simple', async () => {
    expect(files.loadYAML(await resolveTemplate('query/resolve-simple/service-template.yaml'))).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/resolve-simple/expected-service-template.yaml'))
    )
})

async function resolveTemplate(templatePath: string) {
    const output = files.temporaryFile()
    await resolveQueries({
        output: output,
        template: path.join(__dirname, templatePath),
    })
    return output
}

async function getResult(query: string) {
    return runQuery({output: '', query: query, source: 'file'})
}
