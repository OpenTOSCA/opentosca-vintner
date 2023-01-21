import {expect} from 'chai'

export async function expectAsyncThrow(fn: () => Promise<unknown>, error: string) {
    try {
        await fn()
    } catch (e) {
        expect(() => {
            throw e
        }).to.be.throw(error)
    }
}
