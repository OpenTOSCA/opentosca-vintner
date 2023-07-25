import * as check from '#check'
import * as files from '#files'

export type TemplateUnpackageOptions = {
    template: string
    output: string
}

export default async function (options: TemplateUnpackageOptions) {
    if (check.isUndefined(options.template)) throw new Error(`Template not defined`)
    if (check.isUndefined(options.output)) throw new Error(`Output not defined`)

    if (files.isFile(options.template)) {
        await files.extractArchive(options.template, options.output)
        return
    }

    if (files.isLink(options.template)) {
        const file = await files.download(options.template)
        await files.extractArchive(file, options.output)
        return
    }

    throw new Error(`Template ${options.template} is neither a file nor a HTTP(S) link`)
}
