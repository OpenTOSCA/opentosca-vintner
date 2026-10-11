import {Shell} from '#shell'

describe('shell', () => {
    it('executes command using bash', async () => {
        await new Shell(false, true).execute(['[ -n "$BASH_VERSION" ]'])
    })
})
