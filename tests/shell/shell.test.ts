import * as files from '#files'
import {quote, quoteDirectory, raw, Shell} from '#shell'
import {expect} from 'chai'
import path from 'path'

describe('shell', () => {
    it('quote', () => {
        expect(quote('opera')).to.equal('opera')
        expect(quote('/tmp/a-b_c.yaml')).to.equal('/tmp/a-b_c.yaml')
        expect(quote('a b')).to.equal(`'a b'`)
        expect(quote(`it's`)).to.equal(`'it'\\''s'`)
        expect(quote('')).to.equal(`''`)
        expect(quote(raw('a && b'))).to.equal('a && b')
    })

    it('quote directory', () => {
        expect(quoteDirectory('~')).to.equal('~')
        expect(quoteDirectory('~/opera')).to.equal('~/opera')
        expect(quoteDirectory('~/my opera')).to.equal(`~/'my opera'`)
        expect(quoteDirectory('/my opera; id')).to.equal(`'/my opera; id'`)
    })

    it('execute: argument is not interpreted', async () => {
        const dir = files.temporaryDirent()
        files.createDirectory(dir)
        const marker = path.join(dir, 'pwned')
        const output = path.join(dir, 'output')
        const payload = `a b; touch ${marker} $(touch ${marker}) \`touch ${marker}\` 'q' "dq" | & > < * ~`

        await new Shell(false, true).execute(['printf', '%s', payload, raw('>'), output])

        expect(files.loadFile(output)).to.equal(payload)
        expect(files.exists(marker)).to.equal(false)
    })

    it('execute: environment is not interpreted', async () => {
        const dir = files.temporaryDirent()
        files.createDirectory(dir)
        const marker = path.join(dir, 'pwned')
        const output = path.join(dir, 'output')
        const payload = `x; touch ${marker} $(touch ${marker})`

        await new Shell(false, true).execute(['printenv', 'VINTNER_TEST', raw('>'), output], {
            env: {VINTNER_TEST: payload},
        })

        expect(files.loadFile(output)).to.equal(payload + '\n')
        expect(files.exists(marker)).to.equal(false)
    })

    it('execute: invalid environment variable name', async () => {
        let error: Error | undefined
        try {
            await new Shell(false, true).execute(['true'], {env: {'X=1; id #': 'value'}})
        } catch (e) {
            error = e
        }
        expect(error?.message).to.equal('Environment variable "X=1; id #" not allowed')
    })
})
