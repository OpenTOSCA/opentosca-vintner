import chai from 'chai'
import chaiDatetime from 'chai-datetime'
chai.use(chaiDatetime)

// See https://github.com/istanbuljs/nyc/issues/619#issuecomment-754609188
import sms from 'source-map-support'
sms.install({
    hookRequire: true,
})
