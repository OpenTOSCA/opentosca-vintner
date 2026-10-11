import Controller from '#controller'
import * as files from '#files'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'
import {expect} from 'chai'

describe('instances state', () => {
    it('force ignores lock', async () => {
        await Controller.setup.reset({force: true})

        const instance = new Instance('state-force')
        files.createDirectory(instance.getInstanceDirectory())
        instance.setInfo({
            name: instance.getName(),
            state: 'INITIATED',
            creation_timestamp: 0,
            template_timestamp: 0,
        })

        const release = await lock.lock(instance.getLockKey())
        try {
            await Controller.instances.state({instance: instance.getName(), state: 'DEPLOYED', force: true})
        } finally {
            release()
        }

        expect(instance.loadInfo().state).to.equal('DEPLOYED')
    })
})
