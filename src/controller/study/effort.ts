import * as assert from '#assert'
import Controller from '#controller'
import * as Stats from '#controller/stats/stats'
import * as files from '#files'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

export type StudyEffortOptions = {
    dir: string
    objects?: string[]
    experimental: boolean
    write?: boolean
    simple?: boolean
    output?: string
}

export default async function (options: StudyEffortOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    options.objects = options.objects ?? Object.values(Stats.ID)
    options.write = options.write ?? true
    options.simple = options.simple ?? false
    options.output = options.output ? path.resolve(options.output) : path.join(options.dir, 'study.effort.data.yaml')

    const totalByStage: Stats.Map[] = []
    const diffByStage: Stats.Map[] = []

    const diffByObject: {[key: string]: Stats.List} = {}
    const sumByObject: Stats.Map = {}

    const stages = 5
    for (let stage = 0; stage <= stages; stage++) {
        std.log()
        std.log('Stage', stage)
        const stageDir = 'stage-' + stage
        totalByStage[stage] = {}
        diffByStage[stage] = {}

        /**
         * EDMM
         */
        if (options.objects.includes(Stats.ID.edmm)) {
            std.log(`${Stats.ID.edmm} ...`)
            const edmmFiles = files.walkDirectory(path.join(options.dir, Stats.ID.edmm, stageDir))
            totalByStage[stage][Stats.ID.edmm] = Stats.sum(
                await Promise.all(
                    edmmFiles.map(file =>
                        Controller.stats.edmm({
                            template: file,
                            experimental: true,
                        })
                    )
                )
            )
        }

        /**
         * Ansible
         */
        if (options.objects.includes(Stats.ID.ansible)) {
            std.log(`${Stats.ID.ansible} ...`)
            totalByStage[stage][Stats.ID.ansible] = await Controller.stats.ansible({
                dir: path.join(options.dir, Stats.ID.ansible, stageDir),
                experimental: true,
            })
        }

        /**
         * Terraform
         */
        if (options.objects.includes(Stats.ID.terraform)) {
            std.log(`${Stats.ID.terraform} ...`)
            totalByStage[stage][Stats.ID.terraform] = await Controller.stats.terraform({
                dir: path.join(options.dir, Stats.ID.terraform, stageDir),
                experimental: true,
            })
        }

        /**
         * TOSCA-FM
         */
        if (options.objects.includes(Stats.ID.tosca_fm)) {
            std.log(`${Stats.ID.tosca_fm} ...`)
            totalByStage[stage][Stats.ID.tosca_fm] = await Controller.stats.toscafm({
                dir: path.join(options.dir, Stats.ID.tosca_fm, stageDir),
                experimental: true,
            })
        }

        /**
         * TOSCA
         */
        if (options.objects.includes(Stats.ID.tosca)) {
            std.log(`${Stats.ID.tosca} ...`)
            const toscaBase = path.join(options.dir, Stats.ID.tosca, stageDir)
            const toscaLib = path.join(toscaBase, 'lib')
            const toscaFiles = [path.join(toscaBase, 'model.yaml')]
            if (files.isDirectory(toscaLib)) {
                toscaFiles.push(...files.walkDirectory(path.join(toscaLib, 'substitutions')))
            }
            totalByStage[stage][Stats.ID.tosca] = Stats.sum(
                await Promise.all(
                    toscaFiles.map(file =>
                        Controller.stats.tosca({
                            template: file,
                            experimental: true,
                        })
                    )
                )
            )
        }

        /**
         * Pattern
         */
        if (options.objects.includes(Stats.ID.pattern)) {
            std.log(`${Stats.ID.pattern} ...`)
            let refinementFiles: string[] = []
            const refinementsDir = path.join(options.dir, Stats.ID.pattern, stageDir, 'lib', 'refinements')
            if (files.isDirectory(refinementsDir)) refinementFiles = files.walkDirectory(refinementsDir)
            totalByStage[stage][Stats.ID.pattern] = Stats.sum([
                ...(await Promise.all(
                    refinementFiles.map(
                        async file =>
                            await Controller.stats.pattern({
                                template: file,
                                experimental: true,
                            })
                    )
                )),
                await Controller.stats.edmm({
                    template: path.join(options.dir, Stats.ID.pattern, stageDir, 'model.yaml'),
                    id: Stats.ID.pattern,
                    experimental: true,
                }),
            ])
        }

        /**
         * Pulumi
         */
        if (options.objects.includes(Stats.ID.pulumi)) {
            std.log(`${Stats.ID.pulumi} ...`)
            totalByStage[stage][Stats.ID.pulumi] = await Controller.stats.pulumi({
                dir: path.join(options.dir, Stats.ID.pulumi, stageDir),
                experimental: true,
            })
        }

        /**
         * EJS
         */
        if (options.objects.includes(Stats.ID.ejs)) {
            std.log(`${Stats.ID.ejs} ...`)
            totalByStage[stage][Stats.ID.ejs] = await Controller.stats.ejs({
                dir: path.join(options.dir, Stats.ID.ejs, stageDir),
                experimental: true,
            })
        }

        /**
         * VDMM
         */
        if (options.objects.includes(Stats.ID.vdmm)) {
            std.log(`${Stats.ID.vdmm} ...`)
            totalByStage[stage][Stats.ID.vdmm] = await Controller.stats.vdmm({
                template: path.join(options.dir, Stats.ID.vdmm, stageDir, 'model.yaml'),
                experimental: true,
            })
        }

        /**
         * Diff
         */
        for (const id of Object.values(Stats.ID).filter(it => options.objects!.includes(it))) {
            const currentTotal = totalByStage[stage][id]
            if (stage === 0) {
                diffByStage[stage][id] = currentTotal
                diffByObject[id] = [currentTotal]
            } else {
                const previousTotal = totalByStage[stage - 1][id]

                if (previousTotal.id !== currentTotal.id)
                    throw new Error(`Previous has ${previousTotal.id} but currently is ${currentTotal.id}`)

                const currentDiff = Stats.diff(utils.copy([currentTotal, previousTotal]))
                diffByStage[stage][id] = currentDiff
                diffByObject[id].push(utils.copy(diffByStage[stage][id]))

                if (stage === 1) {
                    sumByObject[id] = currentDiff
                } else {
                    sumByObject[id] = Stats.sum(utils.copy([currentDiff, sumByObject[id]]))
                }
            }
        }

        /**
         * Total
         */
        std.log()
        std.log('Stage', stage, 'Total')
        std.log(toTableByStage(totalByStage[stage], options.simple))
        std.log('Stage', stage, 'Total')
        std.log(toLatexByStage(totalByStage[stage]))
        std.log()

        /**
         * Diff
         */
        std.log()
        std.log('Stage', stage, 'Diff')
        std.log(toTableByStage(diffByStage[stage], options.simple))
        std.log('Stage', stage, 'Diff')
        std.log(toLatexByStage(diffByStage[stage]))

        /**
         * Sum
         */
        const enrichedSum = enrichSumTable(sumByObject)
        std.log()
        std.log('Stage', stage, 'Sum')
        std.log(toTableByStage(enrichedSum, options.simple))
        std.log('Stage', stage, 'Sum')
        std.log(toLatexByStage(enrichedSum))
    }

    std.log()
    std.log()
    std.log()
    std.log()
    std.log('---------------------------------------------------------------------------------------------------')
    std.log()
    std.log()
    std.log()
    for (const id of Object.values(options.objects)) {
        std.log()
        std.log(`${id} ...`)

        const data = diffByObject[id]
        const sum = sumByObject[id]

        const table = data.map((stats, index) => ({stage: 'S' + index, ...stats}))
        //table.push({stage: '0 - ' + stages, ... })
        //table.push({stage: '1 - ' + stages, ...sum})

        std.log(
            std.table(
                options.simple
                    ? table.map(stat => ({
                          stage: stat.stage,
                          files: stat.files,
                          elements: stat.elements,
                          variability: stat.variability,
                          loc: stat.loc,
                      }))
                    : table
            )
        )

        std.log(
            files.toLatex(table, {
                headers: ['stage', 'elements', 'variability', 'files', 'loc'],
                index: false,
            })
        )
    }

    /**
     * Return data
     */
    if (options.write)
        files.storeYAML(options.output, {
            store: totalByStage,
            diff: diffByStage,
            sum: sumByObject,
        })
}

function toTableByStage(map: Stats.Map, simple: boolean): string {
    const table = Object.values(map)
    return std.table(
        simple
            ? table.map(stat => ({
                  id: stat.id,
                  files: stat.files,
                  elements: stat.elements,
                  variability: stat.variability,
                  loc: stat.loc,
              }))
            : table
    )
}

function toLatexByStage(map: Stats.Map): string {
    return files.toLatex(Object.values(map), {
        headers: ['id', 'elements', 'variability', 'files', 'loc'],
        index: false,
    })
}

function enrichSumTable(data: Stats.Map): Stats.Map {
    const enriched: Stats.Map = {}

    const vdmm = data[Stats.ID.vdmm]

    for (const other of Object.values(data)) {
        if (other.id === Stats.ID.vdmm) {
            enriched[other.id] = vdmm
            continue
        }

        enriched[other.id] = {
            id: other.id,
            files: prettyBenefit(vdmm.files, other.files),
            loc: prettyBenefit(vdmm.loc, other.loc),

            elements: prettyBenefit(vdmm.elements, other.elements),
            inputs: prettyBenefit(vdmm.inputs, other.inputs),
            outputs: prettyBenefit(vdmm.outputs, other.outputs),
            components: prettyBenefit(vdmm.components, other.components),
            properties: prettyBenefit(vdmm.properties, other.properties),
            relations: prettyBenefit(vdmm.relations, other.relations),
            artifacts: prettyBenefit(vdmm.artifacts, other.artifacts),
            technologies: prettyBenefit(vdmm.technologies, other.technologies),

            variability: prettyBenefit(vdmm.variability, other.variability),
            conditions: prettyBenefit(vdmm.conditions, other.conditions),
            expressions: prettyBenefit(vdmm.expressions, other.expressions),
            mappings: prettyBenefit(vdmm.mappings, other.mappings),
        }
    }

    return enriched
}

function prettyBenefit(vdmm: number, other: number): number {
    return `${other} (${benefit(vdmm, other)})` as unknown as number
}

function benefit(vdmm: number, other: number): string {
    if (vdmm === 0 && other === 0) return '0\\%'
    if (other === 0) return 'N/A'
    const reduction = -1 * Math.floor(((other - vdmm) / other) * 100)
    const abs = Math.abs(reduction)
    const sign = reduction > 0 ? '+' : '\\textminus'
    return `${sign}${abs}\\%`
}
