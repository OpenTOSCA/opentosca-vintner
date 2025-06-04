import * as assert from '#assert'
import * as check from '#check'
import * as Stats from '#controller/utils/stats/stats'
import * as files from '#files'
import {Shell} from '#shell'
import * as utils from '#utils'
import path from 'path'

export type UtilsStatsTerraformOptions = {
    dir: string
    experimental: boolean
}

export default async function (options: UtilsStatsTerraformOptions) {
    assert.isDefined(options.dir, 'Path not defined')
    assert.isTrue(options.experimental)

    /**
     * Stats
     */
    const stats = new Stats.Builder('Terraform')

    /**
     * Model, LOC
     */
    const variablesFile = path.join(options.dir, 'variables.tf')
    const variables = await hcl2json<HCLVariables>(variablesFile)
    stats.loc += files.countNotBlankLines(variablesFile)
    stats.models++

    const modelFile = path.join(options.dir, 'model.tf')
    const model = await hcl2json<HCLModel>(modelFile)
    stats.loc += files.countNotBlankLines(modelFile)
    stats.models++

    const locals = utils.first(model.locals ?? []) ?? {}

    /**
     * Inputs
     */
    const inputs = Object.keys(variables.variable).length
    stats.inputs += inputs

    /**
     * No Outputs
     */

    /**
     * Components
     */
    stats.components += Object.keys(model.module).length

    /**
     * Properties
     */
    stats.properties += Object.keys(locals).length
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

        acc += (module.depends_on ?? []).length
        acc += module.host ? 1 : 0

        return acc
    }, 0)

    /**
     * No Artifacts
     */

    /**
     * No Technologies
     */

    /**
     * Conditions (only support simple ternary expressions)
     */
    stats.conditions += Object.values(locals).reduce<number>((acc, it) => {
        if (check.isString(it)) {
            return acc + countCondition(it)
        }
        return acc
    }, 0)
    stats.conditions += Object.values(model.module).reduce((acc, modules) => {
        const module = utils.first(modules)
        return (
            acc +
            Object.entries(module).reduce<number>((bbc, [key, value]) => {
                if (check.isString(value) && isTernary(value)) {
                    bbc += countCondition(value)
                }

                if (key === 'count') {
                    if (check.isString(value) && !isTernary(value)) {
                        bbc += countCondition(value)
                    }
                }

                return bbc
            }, 0)
        )
    }, 0)

    /**
     * No Expressions
     */

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.build()
}

async function hcl2json<T>(file: string) {
    const tmp = files.temporaryDirent()
    const shell = new Shell(false, true)
    await shell.execute(['hcl2json', file, '>', tmp])
    const result = files.loadJSON<T>(tmp)
    files.removeFile(tmp)
    return result
}

function countCondition(value: string) {
    return isTernary(value) ? Stats.Weights.ternary : Stats.Weights.reference
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
