import {expect} from 'chai'

export async function expectAsyncThrow(fn: () => Promise<unknown>, error: string) {
    try {
        await fn()
    } catch (e) {
        return expect(e.message).to.equal(error)
    }
    throw new Error(`Expected that error "${error}" is thrown`)
}
