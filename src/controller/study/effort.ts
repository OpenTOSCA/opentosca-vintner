import * as assert from '#assert'
import Controller from '#controller'
import * as Stats from '#controller/utils/stats/stats'
import * as files from '#files'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

export type StudyEffortOptions = {
    dir: string
    objects?: string[]
    experimental: boolean
    write?: boolean
}

enum ID {
    ansible = 'Ansible',
    edmm = 'EDMM',
    ejs = 'EJS',
    pattern = 'PATTERN',
    pulumi = 'Pulumi',
    terraform = 'Terraform',
    tosca = 'TOSCA',
    vdmm = 'VDMM',
}

export default async function (options: StudyEffortOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    options.objects = options.objects ?? Object.values(ID)
    options.write = options.write ?? true

    const total: Stats.Map[] = []
    const diff: Stats.Map[] = []
    const sum: Stats.Map = {}

    const stages = 5
    for (let stage = 0; stage <= stages; stage++) {
        std.log('')
        std.log('Stage', stage)
        const stageDir = 'stage-' + stage
        total[stage] = {}
        diff[stage] = {}

        /**
         * Ansible
         */
        if (options.objects.includes(ID.ansible)) {
            std.log(`${ID.ansible} ...`)
            total[stage][ID.ansible] = await Controller.utils.stats.ansible({
                dir: path.join(options.dir, ID.ansible, stageDir),
                experimental: true,
            })
        }

        /**
         * EDMM
         */
        if (options.objects.includes(ID.edmm)) {
            std.log(`${ID.edmm} ...`)
            const edmmFiles = files.walkDirectory(path.join(options.dir, ID.edmm, stageDir))
            total[stage][ID.edmm] = Stats.sum(
                await Promise.all(
                    edmmFiles.map(file =>
                        Controller.utils.stats.edmm({
                            template: file,
                            experimental: true,
                        })
                    )
                )
            )
        }

        /**
         * EJS
         */
        if (options.objects.includes(ID.ejs)) {
            std.log(`${ID.ejs} ...`)
            total[stage][ID.ejs] = await Controller.utils.stats.ejs({
                dir: path.join(options.dir, ID.ejs, stageDir),
                experimental: true,
            })
        }

        /**
         * Pattern
         */
        if (options.objects.includes(ID.pattern)) {
            std.log(`${ID.pattern} ...`)
            let refinementFiles: string[] = []
            const refinementsDir = path.join(options.dir, ID.pattern, stageDir, 'lib', 'refinements')
            if (files.isDirectory(refinementsDir)) refinementFiles = files.walkDirectory(refinementsDir)
            total[stage][ID.pattern] = Stats.sum([
                ...(await Promise.all(
                    refinementFiles.map(
                        async file =>
                            await Controller.utils.stats.pattern({
                                template: file,
                                experimental: true,
                            })
                    )
                )),
                await Controller.utils.stats.edmm({
                    template: path.join(options.dir, ID.pattern, stageDir, 'model.yaml'),
                    id: ID.pattern,
                    experimental: true,
                }),
            ])
        }

        /**
         * Pulumi
         */
        if (options.objects.includes(ID.pulumi)) {
            std.log(`${ID.pulumi} ...`)
            total[stage][ID.pulumi] = await Controller.utils.stats.pulumi({
                dir: path.join(options.dir, ID.pulumi, stageDir),
                experimental: true,
            })
        }

        /**
         * Terraform
         */
        if (options.objects.includes(ID.terraform)) {
            std.log(`${ID.terraform} ...`)
            total[stage][ID.terraform] = await Controller.utils.stats.terraform({
                dir: path.join(options.dir, ID.terraform, stageDir),
                experimental: true,
            })
        }

        /**
         * TOSCA
         */
        if (options.objects.includes(ID.tosca)) {
            std.log(`${ID.tosca} ...`)
            const toscaBase = path.join(options.dir, ID.tosca, stageDir)
            const toscaLib = path.join(toscaBase, 'lib')
            const toscaFiles = [path.join(toscaBase, 'model.yaml')]
            if (files.isDirectory(toscaLib)) {
                toscaFiles.push(path.join(toscaLib, 'other.yaml'))
                toscaFiles.push(path.join(toscaLib, 'webshop.yaml'))
                toscaFiles.push(...files.walkDirectory(path.join(toscaLib, 'substitutions')))
            }
            total[stage][ID.tosca] = Stats.sum(
                await Promise.all(
                    toscaFiles.map(file =>
                        Controller.utils.stats.tosca({
                            template: file,
                            experimental: true,
                        })
                    )
                )
            )
        }

        /**
         * VDMM
         */
        if (options.objects.includes(ID.vdmm)) {
            std.log(`${ID.vdmm} ...`)
            total[stage][ID.vdmm] = await Controller.utils.stats.vdmm({
                template: path.join(options.dir, ID.vdmm, stageDir, 'model.yaml'),
                experimental: true,
            })
        }

        /**
         * Diff
         */
        for (const id of Object.values(ID).filter(it => options.objects!.includes(it))) {
            const currentTotal = total[stage][id]
            if (stage === 0) {
                diff[stage][id] = currentTotal
            } else {
                const previousTotal = total[stage - 1][id]

                if (previousTotal.id !== currentTotal.id)
                    throw new Error(`Previous has ${previousTotal.id} but currently is ${currentTotal.id}`)

                const currentDiff = Stats.diff(utils.copy([currentTotal, previousTotal]))
                diff[stage][id] = currentDiff

                if (stage === 1) {
                    sum[id] = currentDiff
                } else {
                    sum[id] = Stats.sum(utils.copy([currentDiff, sum[id]]))
                }
            }
        }

        /**
         * Total
         */
        std.log('Stage', stage, 'Total')
        std.log(toTable(total[stage]))

        /**
         * Diff
         */
        std.log('Stage', stage, 'Diff')
        std.log(toTable(diff[stage]))
    }

    /**
     * Diff
     */
    std.log('')
    std.log('Sum Diff')
    std.log(toTable(sum))

    /**
     * Return data
     */
    if (options.write) files.storeYAML(path.join(options.dir, 'study.effort.data.yaml'), {store: total, diff, sum})
}

function toTable(map: Stats.Map): string {
    const table = Object.values(map)
    return std.table(table)
}
