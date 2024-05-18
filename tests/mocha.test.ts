import {expect} from 'chai'

describe('mocha', function () {
    /**
     * Credits https://stackoverflow.com/a/69806578
     */
    it('expected total number of tests', function () {
        let root = this.runnable().parent
        while (!root?.root) root = root?.parent

        const count = (cnt: number, suite: Mocha.Suite) => suite.suites.reduce<number>(count, cnt + suite.tests.length)
        const total = count(0, root)

        expect(total).to.be.greaterThan(400)
    })
})
