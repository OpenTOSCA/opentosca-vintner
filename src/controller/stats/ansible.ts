import * as assert from '#assert'
import * as check from '#check'
import * as Stats from '#controller/stats/stats'
import * as files from '#files'
import path from 'path'

export type UtilsStatsAnsibleOptions = {
    dir: string
    experimental: boolean
}

export default async function (options: UtilsStatsAnsibleOptions) {
    assert.isDefined(options.dir, 'Path not defined')
    assert.isTrue(options.experimental)

    /**
     * Stats
     */
    const stats = new Stats.Builder(Stats.ID.ansible)

    /**
     * Models, LOC
     */
    const argsFile = path.join(options.dir, 'meta', 'argument_specs.yaml')
    const args = files.loadYAML<ArgumentSpecs>(argsFile)
    stats.files++
    stats.loc += files.countNotBlankLines(argsFile)

    const modelFile = path.join(options.dir, 'playbook.yaml')
    const model = files.loadYAML<Playbook>(modelFile)
    stats.files++
    stats.loc += files.countNotBlankLines(modelFile)

    /**
     * Inputs
     */
    stats.inputs += Object.keys(args.argument_specs.playbook.options).filter(Stats.isNotFeature).length

    /**
     * No Outputs
     */

    /**
     * Components (roles and plays)
     */
    stats.components +=
        model.reduce((acc, play) => {
            return acc + (play.roles ?? []).length
        }, 0) + model.length

    /**
     * Properties
     */
    stats.properties += model.reduce((acc, play) => {
        return (
            acc +
            Object.keys(play.vars ?? {}).length +
            (play.roles ?? []).reduce((bbc, role) => {
                return bbc + Object.keys(role.vars ?? {}).length
            }, 0)
        )
    }, 0)

    /**
     * Relations (hosted on relations)
     */
    stats.relations += model.reduce((acc, play) => {
        return acc + (play.roles ?? []).length
    }, 0)

    /**
     * No Artifacts
     */

    /**
     * No Technologies (counted as properties ...)
     */

    /**
     * Conditions (ternaries, when, input descriptions)
     */
    stats.conditions += model.reduce((acc, play) => {
        const roles = play.roles ?? []

        // Ternary in hosts
        const countedHosts = countTernary(play.hosts)

        // Count in play or roles
        const countedWhens =
            countWhen(play) +
            roles.reduce((bbc, role) => {
                return bbc + countWhen(role)
            }, 0)

        // Ternary in vars
        const countedVars = [play.vars ?? {}, ...roles.map(role => role.vars ?? {})].reduce<number>((bbc, vars) => {
            return (
                bbc +
                Object.values(vars).reduce<number>((ccc, value) => {
                    if (check.isString(value)) {
                        ccc += countTernary(value)
                    }
                    return ccc
                }, 0)
            )
        }, 0)

        return acc + countedHosts + countedWhens + countedVars
    }, 0)
    stats.conditions += Object.keys(args.argument_specs.playbook.options)
        .filter(Stats.isNotFeature)
        .filter(it => check.isDefined(args.argument_specs.playbook.options[it].description)).length

    /**
     * Expressions (string interpolation in role names, variability inputs)
     */
    stats.expressions += model.reduce((acc, play) => {
        const roles = play.roles ?? []
        return acc + roles.reduce<number>((bbc, role) => bbc + countExpressions(role.role), 0)
    }, 0)
    stats.expressions += Object.keys(args.argument_specs.playbook.options).filter(Stats.isFeature).length

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.build()
}

type ArgumentSpecs = {
    argument_specs: {
        playbook: {
            options: {
                [key: string]: {
                    type: string
                    description: string
                }
            }
        }
    }
}

type Playbook = Play[]

type Play = {
    hosts: string
    when?: string
    vars?: Vars
    roles?: Role[]
}

type Role = {
    role: string
    when?: string
    vars?: Vars
}

type Vars = {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
}

function countWhen(thing: {when?: string}) {
    return check.isDefined(thing.when) ? Stats.Weights.reference : 0
}

function countTernary(value: string) {
    return isTernary(value) ? Stats.Weights.ternary : 0
}

function isTernary(value: string) {
    return new RegExp(/\{\{.*if.*else.*}}/).test(value)
}

function countExpressions(value: string) {
    return (value.match(/\{\{/) ?? []).length * Stats.Weights.reference
}
