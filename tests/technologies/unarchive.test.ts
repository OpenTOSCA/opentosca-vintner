import {BashUnarchiveSourceArchiveFile} from '#technologies/plugins/rules/utils/utils'
import {expect} from 'chai'

describe('technologies', () => {
    it('unarchive zip archive uses extra opts of zip archive', () => {
        const command = BashUnarchiveSourceArchiveFile('shop', 'zip.archive')
        expect(command).to.contain('unzip /tmp/artifact-shop')
        expect(command).to.contain('[.type=zip.archive]::extra_opts')
    })

    it('unarchive tar archive uses extra opts of tar archive', () => {
        const command = BashUnarchiveSourceArchiveFile('shop', 'tar.archive')
        expect(command).to.contain('tar -xzf /tmp/artifact-shop')
        expect(command).to.contain('[.type=tar.archive]::extra_opts')
    })
})
