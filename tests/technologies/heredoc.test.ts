import * as files from '#files'
import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {BashCopyManagementOperation} from '#technologies/plugins/rules/utils/utils'
import {expect} from 'chai'
import {execFileSync} from 'child_process'
import path from 'path'

describe('technologies', () => {
    it('heredoc of copied management operation is terminated', () => {
        const dir = files.temporaryDirent()
        files.createDirectory(path.join(dir, '.vintner'))

        // Render template variables
        const script =
            BashCopyManagementOperation(MANAGEMENT_OPERATIONS.CONFIGURE)
                .replace(/\{\{ SELF.application_directory \}\}/g, dir)
                .replace(/\{\{[^}]*\}\}/g, 'echo configured') + `\necho done > ${dir}/done`

        execFileSync('bash', ['-c', script], {stdio: 'ignore'})

        expect(files.loadFile(path.join(dir, '.vintner', 'configure.sh'))).to.equal(
            '#!/usr/bin/bash\nset -e\n\necho configured\n'
        )
        expect(files.exists(path.join(dir, 'done'))).to.be.true
    })
})
