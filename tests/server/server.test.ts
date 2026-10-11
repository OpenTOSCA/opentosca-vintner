import server from '#/server'
import Controller from '#controller'
import {expect} from 'chai'
import {AddressInfo} from 'net'

describe('server', () => {
    it('instances routes call matching controller', async () => {
        const instances = Controller.instances as unknown as {[action: string]: (options: unknown) => unknown}
        const originals = {...instances}
        const called: string[] = []
        for (const action of Object.keys(originals)) {
            instances[action] = async () => {
                called.push(action)
            }
        }

        const http = server.create()
        await new Promise<void>(resolve => http.listen(0, '127.0.0.1', resolve))
        const base = `http://127.0.0.1:${(http.address() as AddressInfo).port}`

        try {
            let checked = 0
            for (const action of Object.keys(originals)) {
                called.length = 0
                const response = await fetch(`${base}/instances/${action}`, {
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify({instance: 'test'}),
                })
                if (response.status === 404) continue

                expect(called, `/instances/${action}`).to.deep.equal([action])
                checked++
            }
            expect(checked).to.be.greaterThan(10)
        } finally {
            Object.assign(instances, originals)
            await new Promise<void>(resolve => http.close(() => resolve()))
        }
    })
})
