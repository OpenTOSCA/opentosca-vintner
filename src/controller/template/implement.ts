import * as assert from '#assert'
import Controller from '#controller'
import path from 'path'

export type TemplateImplementOptions = {
    dir: string
}

export default async function (options: TemplateImplementOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    await Controller.technologies.generate({lib: path.join(options.dir, 'lib')})
}
