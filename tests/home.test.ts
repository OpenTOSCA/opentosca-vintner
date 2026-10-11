import env from '#utils/env'
import {expect} from 'chai'
import os from 'os'
import path from 'path'

describe('home', () => {
    it('tests use temporary vintner home', () => {
        expect(env.home).to.not.equal(path.join(os.homedir(), '.opentosca_vintner'))
        expect(env.home.startsWith(path.resolve(os.tmpdir()))).to.be.true
    })
})
