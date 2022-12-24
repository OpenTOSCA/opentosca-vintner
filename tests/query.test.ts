import {expect} from 'chai'
import * as files from '../src/utils/files'
import path from 'path'
import runQuery from '../src/controller/query/run'
import resolveQueries from '../src/controller/template/query'

it('all', () => {
    const result = getResult('FROM templates/tests/query/service-template.yaml SELECT .')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/all/expected-output.yaml')))
})

it('array-access', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp.requirements[1]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/array-access/expected-output.yaml')))
})

it('boolean-and', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[name="dbms" AND type="DBMS"]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/boolean-and/expected-output.yaml')))
})

it('boolean-or', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[type="Database" OR type="DBMS"]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/boolean-or/expected-output.yaml')))
})

it('filter-equals', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[type="VirtualMachine"].name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-equals/expected-output.yaml')))
})

it('filter-existence', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[properties.num_cpus].name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-existence/expected-output.yaml')))
})

it('filter-negation', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[!type="VirtualMachine"].name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-negation/expected-output.yaml')))
})

it('filter-nested', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*[properties.port=3306]'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-nested/expected-output.yaml')))
})

it('filter-regex', () => {
    const result = getResult('FROM templates/tests/query/service-template.yaml SELECT node_templates.*[name=~"vm_"]')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-regex/expected-output.yaml')))
})

it('group', () => {
    const result = getResult('FROM templates/tests/query/service-template.yaml SELECT GROUP(database_group)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/group/expected-output.yaml')))
})

it('match-next', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="Tomcat"])-->(node) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-next/expected-output.yaml')))
})

it('match-previous', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml MATCH (node)<--([type="Tomcat"]) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-previous/expected-output.yaml')))
})

it('match-rel-filter', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ()-{[type="ConnectsTo"]}->(node2) SELECT node2'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-rel-filter/expected-output.yaml')))
})

it('match-single', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml MATCH (node[type="WebApplication"]) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-single/expected-output.yaml')))
})

it('match-length-any', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="WebApplication"])-{*}->(node[type="OpenStack"]) SELECT node'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-length-any/expected-output.yaml')))
})

it('match-length-range', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml MATCH ([type="Tomcat"])-{*1..2}->(node) SELECT node.*.name'
    )
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-length-range/expected-output.yaml')))
})

it('node-template', () => {
    const result = getResult('FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/node-template/expected-output.yaml')))
})

it('policy', () => {
    const result = getResult('FROM templates/tests/query/service-template.yaml SELECT POLICY(placement_policy)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/policy/expected-output.yaml')))
})

it('result-structure-simple', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp{name, type}'
    )
    expect(result).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/result-structure-simple/expected-output.yaml'))
    )
})

it('result-structure-complex', () => {
    const result = getResult(
        'FROM templates/tests/query/service-template.yaml SELECT node_templates.*{"Node Name": name, "Node Type": type}'
    )
    expect(result).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/result-structure-complex/expected-output.yaml'))
    )
})

it('shortcut-property', () => {
    const result = getResult('FROM templates/tests/query/service-template.yaml SELECT node_templates.webapp.#port')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/shortcut-property/expected-output.yaml')))
})

it('resolve-chain', () => {
    expect(files.loadYAML(resolveTemplate('query/resolve-chain/service-template.yaml'))).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/resolve-chain/expected-service-template.yaml'))
    )
})

it('resolve-loop', () => {
    expect(() => resolveTemplate('query/resolve-loop/service-template.yaml')).to.throw(
        'Circular dependencies detected. Unable to resolve queries in your template.'
    )
})

it('resolve-self', () => {
    expect(files.loadYAML(resolveTemplate('query/resolve-self/service-template.yaml'))).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/resolve-self/expected-service-template.yaml'))
    )
})

it('resolve-simple', () => {
    expect(files.loadYAML(resolveTemplate('query/resolve-simple/service-template.yaml'))).to.deep.equal(
        files.loadYAML(path.join(__dirname, 'query/resolve-simple/expected-service-template.yaml'))
    )
})

function resolveTemplate(templatePath: string): string {
    const output = files.temporaryFile()
    resolveQueries({
        output: output,
        template: path.join(__dirname, templatePath),
    })
    return output
}

function getResult(query: string): Object {
    return runQuery({output: '', query: query, source: 'file'})
}
