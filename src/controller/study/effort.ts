import * as assert from '#assert'
import Controller from '#controller'
import * as Stats from '#controller/utils/stats/stats'
import * as files from '#files'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

export type StudyEffortOptions = {
    dir: string
    experimental: boolean
}

export default async function (options: StudyEffortOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    const store: Stats.Stats[][] = []
    const stages = 5
    for (let stage = 0; stage <= stages; stage++) {
        std.log('Stage', stage)
        const stageDir = 'stage-' + stage
        store[stage] = []

        /**
         * Ansible
         */
        std.log('Ansible ...')
        store[stage].push(
            await Controller.utils.stats.ansible({
                dir: path.join(options.dir, 'Ansible', stageDir),
                experimental: true,
            })
        )

        /**
         * EDMM
         */
        std.log('EDMM ...')
        const edmmFiles = files.walkDirectory(path.join(options.dir, 'EDMM', stageDir))
        store[stage].push(
            Stats.sum(
                await Promise.all(
                    edmmFiles.map(file =>
                        Controller.utils.stats.edmm({
                            template: file,
                            experimental: true,
                        })
                    )
                )
            )
        )

        /**
         * EJS
         */
        std.log('EJS ...')
        store[stage].push(
            await Controller.utils.stats.ejs({
                dir: path.join(options.dir, 'EJS', stageDir),
                experimental: true,
            })
        )

        /**
         * Pattern
         */
        // TODO: stage dir
        std.log('PATTERN ...')
        let refinementFiles: string[] = []
        const refinementsDir = path.join(options.dir, 'PATTERN', 'stage-X', 'lib', 'refinements')
        if (files.isDirectory(refinementsDir)) refinementFiles = files.walkDirectory(refinementsDir)
        store[stage].push(
            Stats.sum([
                ...(await Promise.all(
                    refinementFiles.map(file =>
                        Controller.utils.stats.pattern({
                            template: file,
                            experimental: true,
                        })
                    )
                )),
                await Controller.utils.stats.edmm({
                    template: path.join(options.dir, 'PATTERN', 'stage-X', 'model.yaml'),
                    experimental: true,
                }),
            ])
        )

        /**
         * Pulumi
         */
        std.log('Pulumi ...')
        store[stage].push(
            await Controller.utils.stats.pulumi({
                dir: path.join(options.dir, 'Pulumi', stageDir),
                experimental: true,
            })
        )

        /**
         * Terraform
         */
        // TODO: stage dir
        std.log('Terraform ...')
        store[stage].push(
            await Controller.utils.stats.terraform({
                dir: path.join(options.dir, 'Terraform', 'stage-X'),
                experimental: true,
            })
        )

        /**
         * TOSCA
         */
        std.log('TOSCA ...')
        const toscaFiles = [path.join(options.dir, 'TOSCA', stageDir, 'model.yaml')]
        const substitutionsDir = path.join(options.dir, 'TOSCA', stageDir, 'lib', 'substitutions')
        if (files.isDirectory(substitutionsDir)) toscaFiles.push(...files.walkDirectory(substitutionsDir))
        store[stage].push(
            Stats.sum(
                await Promise.all(
                    toscaFiles.map(file =>
                        Controller.utils.stats.tosca({
                            template: file,
                            experimental: true,
                        })
                    )
                )
            )
        )

        /**
         * VDMM
         */
        std.log('VDMM ...')
        store[stage].push(
            await Controller.utils.stats.vdmm({
                template: path.join(options.dir, 'VDMM', stageDir, 'model.yaml'),
                experimental: true,
            })
        )

        std.log('')
    }

    /**
     * Diff
     */
    // TODO: already calc this above
    const diff: Stats.Stats[][] = []
    for (let stage = 0; stage <= stages; stage++) {
        const stats = store[stage]
        diff[stage] = []

        for (let index = 0; index < stats.length; index++) {
            const current = stats[index]
            if (stage === 0) {
                diff[stage][index] = current
            } else {
                const previous = store[stage - 1][index]

                if (previous.id !== current.id)
                    throw new Error(`Previous has ${previous.id} but currently is ${current.id}`)

                diff[stage][index] = Stats.diff(utils.copy([current, previous]))
            }
        }

        std.log('Stage', stage, 'Total')
        std.log(std.table(stats))
        std.log('Stage', stage, 'Diff')
        std.log(std.table(diff[stage]))
    }

    /**
     * Return data
     */
    files.storeYAML(path.join(options.dir, 'study.effort.data.yaml'), {store, diff})
}
