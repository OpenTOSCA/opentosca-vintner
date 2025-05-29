import * as assert from '#assert'
import Controller from '#controller'
import {Stats, StatsBuilder} from '#controller/utils/stats/stats'
import * as files from '#files'
import * as utils from '#utils'
import path from 'path'

export type StudyEffortOptions = {
    dir: string
    experimental: boolean
}

// TODO: this

export default async function (options: StudyEffortOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    /**
     * Ansible
     */
    const Ansible = await Controller.utils.stats.ansible({
        dir: path.resolve(options.dir, 'Ansible', 'stage-X'),
        experimental: true,
    })

    /**
     * EDMM
     */
    const edmmFiles = files.walkDirectory(path.resolve(options.dir, 'EDMM', 'stage-5'))
    const EDMM = utils.sumObjects<StatsBuilder>(
        await Promise.all(
            edmmFiles.map(file =>
                Controller.utils.stats.edmm({
                    template: file,
                    experimental: true,
                })
            )
        )
    )

    /**
     * EJS
     */
    const EJS = await Controller.utils.stats.ejs({
        template: path.resolve(options.dir, 'EJS', 'stage-5', 'model.ejs'),
        experimental: true,
    })

    /**
     * Pattern
     */
    let refinementFiles: string[] = []
    const refinementsDir = path.join(options.dir, 'PATTERN', 'stage-X', 'lib', 'refinements')
    if (files.isDirectory(refinementsDir)) refinementFiles = files.walkDirectory(refinementsDir)
    const PATTERN = utils.sumObjects<Stats>([
        await Controller.utils.stats.edmm({
            template: path.join(options.dir, 'PATTERN', 'stage-X', 'model.yaml'),
            experimental: true,
        }),
        ...(await Promise.all(
            refinementFiles.map(file =>
                Controller.utils.stats.pattern({
                    template: file,
                    experimental: true,
                })
            )
        )),
    ])

    /**
     * Pulumi
     */
    // TODO: Pulumi
    const Pulumi = {}

    /**
     * Terraform
     */
    const Terraform = await Controller.utils.stats.terraform({
        dir: path.resolve(options.dir, 'Terraform', 'stage-X'),
        experimental: true,
    })

    /**
     * TOSCA
     */
    const toscaFiles = [path.join(options.dir, 'TOSCA', 'stage-5', 'model.yaml')]
    const substitutionsDir = path.join(options.dir, 'TOSCA', 'stage-5', 'lib', 'substitutions')
    if (files.isDirectory(substitutionsDir)) toscaFiles.push(...files.walkDirectory(substitutionsDir))
    const TOSCA = utils.sumObjects<StatsBuilder>(
        await Promise.all(
            toscaFiles.map(file =>
                Controller.utils.stats.tosca({
                    template: file,
                    experimental: true,
                })
            )
        )
    )

    /**
     * VDMM
     */
    const VDMM = await Controller.utils.stats.vdmm({
        template: path.join(options.dir, 'VDMM', 'stage-5', 'model.yaml'),
        experimental: true,
    })

    /**
     * Print
     */
    console.table([
        {id: 'Ansible', ...Ansible},
        {id: 'EDMM', ...EDMM},
        {id: 'EJS', ...EJS},
        {id: 'PATTERN', ...PATTERN},
        {id: 'Pulumi', ...Pulumi},
        {id: 'Terraform', ...Terraform},
        {id: 'TOSCA', ...TOSCA},
        {id: 'VDMM', ...VDMM},
    ])
}
