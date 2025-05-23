import Controller from '#controller'
import {toReportPath} from '#controller/template/assign'
import * as files from '#files'
import {expect} from 'chai'
import path from 'path'

describe('deployment technology enricher', () => {
    it('test', async () => {
        const output = files.temporaryDirent() + '.yaml'
        await Controller.template.assign({
            template: path.join(__dirname, 'template.yaml'),
            output,
        })

        const result = await files.loadYAML(path.join(output))
        expect(result).to.deep.equal(await files.loadYAML(path.join(__dirname, 'expected.template.yaml')))
        files.removeFile(output)

        const reportPath = toReportPath(output)
        const report = await files.loadYAML(reportPath)
        expect(report).to.deep.equal(await files.loadYAML(path.join(__dirname, 'expected.report.yaml')))
        files.removeFile(reportPath)
    })
})
