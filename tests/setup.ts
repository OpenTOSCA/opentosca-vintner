import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import fs from 'fs'
import os from 'os'
import path from 'path'
chai.use(chaiDatetime)

// See https://github.com/istanbuljs/nyc/issues/619#issuecomment-754609188
import sms from 'source-map-support'
sms.install({
    hookRequire: true,
})

// Use temporary vintner home, since tests reset it, i.e., would delete the local setup
// (must be set before "#utils/env" is loaded)
process.env.OPENTOSCA_VINTNER_HOME_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'opentosca-vintner--home-'))
