import {expect} from 'chai'
import * as files from '../src/utils/files';
import path from 'path';
import {Resolver} from '../src/query/resolver'
import {QueryTemplateArguments} from '../src/controller/query/resolve';

it('all', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT .')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/all/expected-output.yaml')))
})

it('group', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT GROUP(database_group)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/group/expected-output.yaml')))
})

it('node-template', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT node_templates.webapp')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/node-template/expected-output.yaml')))
})

it('policy', () => {
    const result = getResult('FROM template/tests/query/service-template.yaml SELECT POLICY(placement_policy)')
    expect(result).to.deep.equal(files.loadYAML(path.join(__dirname, 'query/policy/expected-output.yaml')))
})

function getResult(query: string): Object {
    const resolver = new Resolver()
    const args: QueryTemplateArguments = {output: '', query: query, source: 'file'}
    return resolver.resolve(args)[0].result
}
