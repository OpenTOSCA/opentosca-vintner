import * as files from '#files'
import * as utils from '#utils'
import archiver from 'archiver'
import {expect} from 'chai'
import * as fs from 'fs'
import path from 'path'

describe('files', () => {
    it('store only if changed: changed', async () => {
        const file = files.temporaryDirent()

        files.storeFile(file, 'value')
        const first = files.statDirent(file).mtime

        await utils.sleep(1111)

        files.storeFile(file, 'another_value', {onlyIfChanged: true})
        const second = files.statDirent(file).mtime

        expect(files.loadFile(file)).to.equal('another_value')

        expect(first).to.beforeTime(second)
    })

    it('store only if changed: not changed', async () => {
        const file = files.temporaryDirent()

        files.storeFile(file, 'value')
        const first = files.statDirent(file).mtime

        await utils.sleep(1111)

        files.storeFile(file, 'value', {onlyIfChanged: true})
        const second = files.statDirent(file).mtime

        expect(files.loadFile(file)).to.equal('value')
        expect(first).to.equalTime(second)
    })

    it('extract archive', async () => {
        const source = files.temporaryDirent()
        files.createDirectory(path.join(source, 'nested', 'deep'))
        files.storeFile(path.join(source, 'file.txt'), 'value')
        files.storeFile(path.join(source, 'nested', 'deep', 'file.txt'), 'nested_value')
        fs.chmodSync(path.join(source, 'file.txt'), 0o755)

        const archive = files.temporaryDirent()
        await files.createArchive(source, archive)

        const target = files.temporaryDirent()
        await files.extractArchive(archive, path.relative(process.cwd(), target))

        expect(files.loadFile(path.join(target, 'file.txt'))).to.equal('value')
        expect(files.loadFile(path.join(target, 'nested', 'deep', 'file.txt'))).to.equal('nested_value')
        expect(fs.statSync(path.join(target, 'file.txt')).mode & 0o100).to.equal(0o100)
    })

    it('extract archive: reject symbolic link', async () => {
        const archive = files.temporaryDirent()
        await new Promise<void>((resolve, reject) => {
            const zip = archiver('zip')
            const stream = fs.createWriteStream(archive)
            stream.on('close', () => resolve())
            zip.on('error', reject).pipe(stream)
            zip.symlink('link', '/etc/passwd')
            zip.finalize()
        })

        const target = files.temporaryDirent()
        let error: Error | undefined
        try {
            await files.extractArchive(archive, target)
        } catch (e) {
            error = e
        }

        expect(error?.message).to.equal('Archive entry "link" is a symbolic link')
        expect(fs.existsSync(path.join(target, 'link'))).to.equal(false)
    })
})
