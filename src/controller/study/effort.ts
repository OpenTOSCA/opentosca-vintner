import * as assert from '#assert'
import Controller from '#controller'
import path from 'path'

export type StudyEffortOptions = {
    dir: string
    experimental: boolean
}

// TODO: this

export default async function (options: StudyEffortOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    const Ansible = await Controller.utils.stats.ansible({
        dir: path.resolve(options.dir, 'Ansible', 'stage-X'),
        experimental: true,
    })

    const EDMM = await Controller.utils.stats.edmm({
        template: path.resolve(options.dir, 'EDMM', 'stage-5'),
        experimental: true,
    })

    const EJS = await Controller.utils.stats.ejs({
        template: path.resolve(options.dir, 'EJS', 'stage-5'),
        experimental: true,
    })

    // TODO: PATTERN

    // TODO: Pulumi

    const Terraform = await Controller.utils.stats.terraform({
        template: path.resolve(options.dir, 'Terraform', 'stage-X'),
        experimental: true,
    })

    // TODO: TOSCA

    const VDMM = await Controller.utils.stats.vdmm({
        template: path.join(options.dir, 'VDMM', 'stage-5', 'model.yaml'),
        experimental: true,
    })
}
