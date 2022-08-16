import {expect} from 'chai'
import {getMedianFromSorted, hrtime2ms, prettyBytes, prettyMilliseconds, prettyNumber, toList} from '../src/utils/utils'

it('median of array of even length', () => {
    const median = getMedianFromSorted([1, 2])
    expect(median).to.equal(1.5)
})

it('median of array of odd length', () => {
    const median = getMedianFromSorted([1, 2, 3])
    expect(median).to.equal(2)
})

it('prettyBytes: should return kb', () => {
    const result = prettyBytes(800000)
    expect(result).to.equal('800 kb')
})

it('prettyBytes: should return mb', () => {
    const result = prettyBytes(1001000)
    expect(result).to.equal('1.001 mb')
})

it('prettyMilliseconds: should return ms', () => {
    const result = prettyMilliseconds(800)
    expect(result).to.equal('800.000 ms')
})

it('prettyMilliseconds: should return s', () => {
    const result = prettyMilliseconds(1001)
    expect(result).to.equal('1.001 s')
})

it('prettyNumber: should return 800', () => {
    const result = prettyNumber(800)
    expect(result).to.equal('800')
})

it('prettyNumber: should return 8,000', () => {
    const result = prettyNumber(8000)
    expect(result).to.equal('8,000')
})

it('prettyNumber: should return 8,000,000', () => {
    const result = prettyNumber(8000000)
    expect(result).to.equal('8,000,000')
})

it('prettyNumber: should return 8,000,000.120', () => {
    const result = prettyNumber(8000000.12)
    expect(result).to.equal('8,000,000.120')
})

it('hrtime2ms', () => {
    const result = hrtime2ms([1, 0])
    expect(result).to.equal(1000)
})

it('hrtime2ms', () => {
    const result = hrtime2ms([1, 1])
    expect(result).to.equal(1000.000001)
})

it('hrtime2ms', () => {
    const result = hrtime2ms([1, 1000000])
    expect(result).to.equal(1001)
})

it('toList: single element', () => {
    const result = toList(1)
    expect(result).to.eql([1])
})

it('toList: list', () => {
    const result = toList([1])
    expect(result).to.eql([1])
})
