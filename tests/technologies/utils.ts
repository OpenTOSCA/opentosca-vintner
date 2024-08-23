import {constructImplementationName, destructImplementationName, RuleData} from '#technologies/utils'
import {expect} from 'chai'

describe('(con/de)struct implementation name', () => {
    it('shop.component~service.application#source.archive::terraform@gcp.appengine', function () {
        const type = 'shop.component'
        const rule: RuleData = {
            component: 'service.application',
            artifact: 'source.archive',
            technology: 'terraform',
            hosting: ['gcp.appengine'],
        }

        const constructed = constructImplementationName({type, rule})
        expect(constructed).to.equal(this.test?.title)

        const destructed = destructImplementationName(constructed)
        expect(destructed).to.deep.equal({type, ...rule})
    })

    it('gcp.appengine~gcp.service::terraform', function () {
        const type = 'gcp.appengine'
        const rule: RuleData = {
            component: 'gcp.service',
            artifact: undefined,
            technology: 'terraform',
            hosting: [],
        }
        const constructed = constructImplementationName({type, rule})
        expect(constructed).to.equal(this.test?.title)

        const destructed = destructImplementationName(constructed)
        expect(destructed).to.deep.equal({type, ...rule})
    })
})
