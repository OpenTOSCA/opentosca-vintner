import {expect} from 'chai'
import * as files from '../src/utils/files';
import {ServiceTemplate} from '../src/specification/service-template';
import path from 'path';
import {Resolver} from '../src/query/resolver'
import {QueryTemplateArguments} from '../src/controller/query/query';

it('select-all', () => {
    const resolver = new Resolver()
    const query = 'FROM template/tests/query-select-all/service-template.yaml SELECT .'
    const args: QueryTemplateArguments = {output: '', query: query, source: 'file'}
    const result = resolver.resolve(args)
    console.log(files.stringify(result[0].result))
    expect(result[0].result).to.deep.equal(
        files.loadFile<ServiceTemplate>(path.join(__dirname, 'query-select-all', 'expected-output.yaml'))
    )
})

it('select-node-template', () => {
    const resolver = new Resolver()
    const query = 'FROM template/tests/query-select-node-template/service-template.yaml SELECT node_templates.webapp'
    const args: QueryTemplateArguments = {output: '', query: query, source: 'file'}
    const result = resolver.resolve(args)
    expect(result[0].result).to.deep.equal(
        files.loadFile<ServiceTemplate>(path.join(__dirname, 'query-select-node-template', 'expected-output.yaml'))
    )
})
