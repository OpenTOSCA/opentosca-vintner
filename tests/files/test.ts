import * as files from '#files'
import * as utils from '#utils'
import {expect} from 'chai'

describe('files', () => {
    it('store only if changed: changed', async () => {
        const file = files.temporary()

        files.storeFile(file, 'value')
        const first = files.stat(file).mtime

        await utils.sleep(1111)

        files.storeFile(file, 'another_value', {onlyIfChanged: true})
        const second = files.stat(file).mtime

        expect(files.loadFile(file)).to.equal('another_value')

        expect(first).to.beforeTime(second)
    })

    it('store only if changed: not changed', async () => {
        const file = files.temporary()

        files.storeFile(file, 'value')
        const first = files.stat(file).mtime

        await utils.sleep(1111)

        files.storeFile(file, 'value', {onlyIfChanged: true})
        const second = files.stat(file).mtime

        expect(files.loadFile(file)).to.equal('value')
        expect(first).to.equalTime(second)
    })
})
