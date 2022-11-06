import PackageManager from '../../src/package-manager'
import * as files from '../../src/utils/files'
import {expect} from 'chai'
import path from 'path'
import config from '../../src/utils/config'

describe('package manager', function () {
    this.timeout(60 * 1000)
    const home = files.temporaryPath()

    before(async () => {
        files.createDirectory(home)
        process.env.OPENTOSCA_VINTNER_HOME_DIR = home
        config.load()
    })

    it('install', async () => {
        const _cwd = process.cwd()
        const cwd = files.temporaryPath()
        files.createDirectory(cwd)
        const file = path.join(cwd, 'dependencies.yaml')
        files.copy(path.join(__dirname, 'dependencies.yaml'), file)

        process.chdir(cwd)
        await PackageManager.install()

        // TODO: metadata.template_version
        expect(files.exists(path.join('lib', 'org.alien4cloud.agentpuppet@1ee103e9c2910667448ff8af57157b11eab3530d')))
            .to.be.true
        expect(files.exists(path.join('lib', 'org.alien4cloud.agentpuppet@3.0.x'))).to.be.true
        expect(files.exists(path.join('lib', 'org.alien4cloud.agentpuppet@develop'))).to.be.true
        expect(files.exists(path.join('lib', 'org.alien4cloud.agentpuppet@v2.0.0'))).to.be.true

        process.chdir(_cwd)
        await PackageManager.purge()
        files.removeDirectory(cwd)
    })

    after(async () => {
        files.removeDirectory(home)
    })
})
