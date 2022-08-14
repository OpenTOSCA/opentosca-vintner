import {expect} from 'chai'
import {getMedianFromSorted} from '../src/utils/utils'

it('median of array of even length', () => {
    const median = getMedianFromSorted([1, 2])
    expect(median).to.equal(1.5)
})

it('median of array of odd length', () => {
    const median = getMedianFromSorted([1, 2, 3])
    expect(median).to.equal(2)
})
