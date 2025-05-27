import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {Shell} from '#shell'
import * as utils from '#utils'
import path from 'path'

export type UtilsStatsTerraformOptions = {
    dir: string
    experimental: boolean
}

type TerraformStats = {
    elements: number
    inputs: number
    components: number
    properties: number
    conditions: number
    relations: number
}

export default async function (options: UtilsStatsTerraformOptions) {
    assert.isDefined(options.dir, 'Path not defined')
    assert.isTrue(options.experimental)

    /**
     * Stats
     */
    const stats: TerraformStats = {
        elements: 0,
        inputs: 0,
        components: 0,
        properties: 0,
        conditions: 0,
        relations: 0,
    }

    /**
     * Model
     */
    const variables = await hcl2json<HCLVariables>(path.join(options.dir, 'variables.tf'))
    const model = await hcl2json<HCLModel>(path.join(options.dir, 'model.tf'))

    /**
     * Inputs
     */
    const inputs = Object.keys(variables.variable).length
    stats.inputs += inputs

    /**
     * Components
     */
    stats.components += Object.keys(model.module).length

    /**
     * Properties
     */
    stats.properties += Object.keys(utils.first(model.locals ?? [])).length
    stats.properties += Object.values(model.module).reduce((acc, modules) => {
        const module = utils.first(modules)
        const ignore = ['source', 'count', 'host', 'depends_on']
        return acc + Object.keys(module).filter(it => !ignore.includes(it)).length
    }, 0)

    /**
     * Relations
     */
    stats.relations += Object.values(model.module).reduce((acc, modules) => {
        const module = utils.first(modules)

        acc += module.depends_on?.length ?? 0
        acc += module.host ? 1 : 0

        return acc
    }, 0)

    /**
     * Conditions
     */
    stats.conditions += Object.keys(model.locals ?? []).filter(it => isTernary(it)).length
    stats.conditions += Object.values(model.module).reduce((acc, modules) => {
        const module = utils.first(modules)
        return (
            acc +
            Object.entries(module).reduce<number>((bbc, [key, value]) => {
                if (check.isString(value) && isTernary(value)) {
                    bbc++
                }

                if (key === 'count') {
                    if (check.isString(value) && !isTernary(value)) bbc++
                }

                // We dont support other kind of variability

                return bbc
            }, 0)
        )
    }, 0)

    /**
     * Elements
     */
    stats.elements += stats.inputs + stats.components + stats.properties + stats.relations

    /**
     * Result
     */
    return stats
}

async function hcl2json<T>(file: string) {
    const tmp = files.temporaryDirent()
    const shell = new Shell()
    await shell.execute(['hcl2json', file, '>', tmp])
    const result = files.loadJSON<T>(tmp)
    files.removeFile(tmp)
    return result
}

function isTernary(value: string) {
    return new RegExp(/\$\{.*\?.*:.*}/).test(value)
}

type HCLValue = string | number | boolean | string[] | number[] | boolean[] | null

type HCLModule = {
    source: string
    host?: string
    hosting?: string
    count?: string
    depends_on?: string[]
} & {[property: string]: HCLValue}

type HCLLocal = {
    [local: string]: HCLValue
}

type HCLModel = {
    locals?: HCLLocal[]
    module: {
        [module: string]: HCLModule[]
    }
}

type HCLVariables = {
    variable: {
        [variable: string]: {type: string}[]
    }
}
