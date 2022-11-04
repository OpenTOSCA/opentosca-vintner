import {expect} from 'chai'
import * as files from '../src/utils/files';
import path from 'path';
import executeQuery from '../src/controller/query/resolve';

it('all', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT .')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/all/expected-output.yaml')))
})

it('boolean-and', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml SELECT node_templates.*[name="dbms" AND type="DBMS"]')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/boolean-and/expected-output.yaml')))
})

it('boolean-or', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml SELECT node_templates.*[type="Database" OR type="DBMS"]')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/boolean-or/expected-output.yaml')))
})

it('filter-equals', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml SELECT node_templates.*[type="VirtualMachine"].name')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-equals/expected-output.yaml')))
})

it('filter-existence', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml SELECT node_templates.*[capabilities].name')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-existence/expected-output.yaml')))
})

it('filter-regex', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml SELECT node_templates.*[name=~"vm_"]')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/filter-regex/expected-output.yaml')))
})

it('group', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT GROUP(database_group)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/group/expected-output.yaml')))
})

it('match-next', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml MATCH ([type="Tomcat"])-->(node) SELECT node')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-next/expected-output.yaml')))
})

it('match-previous', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml MATCH (node)<--([type="Tomcat"]) SELECT node')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-previous/expected-output.yaml')))
})

it('match-single', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml MATCH (node[type="WebApplication"]) SELECT node')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-single/expected-output.yaml')))
})

it('match-length-any', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml MATCH ([type="WebApplication"])-{*}->(node[type=Compute]) SELECT node')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-length-any/expected-output.yaml')))
})

it('match-length-range', () => {
    const result = getResult
    ('FROM template/tests/query/service-template.yaml MATCH ([type="Tomcat"])-{*1..2}->(node) SELECT node.*.name')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/match-length-range/expected-output.yaml')))
})

it('node-template', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT node_templates.webapp')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/node-template/expected-output.yaml')))
})

it('policy', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT POLICY(placement_policy)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/policy/expected-output.yaml')))
})

it('result-structure-simple', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT node_templates.webapp{name, type}')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/result-structure-simple/expected-output.yaml')))
})

it('result-structure-complex', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT node_templates.*{"Node Name": name, "Node Type": type}')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/result-structure-complex/expected-output.yaml')))
})

function getResult(query: string): Object {
    return executeQuery({output: '', query: query, source: 'file'})
}
