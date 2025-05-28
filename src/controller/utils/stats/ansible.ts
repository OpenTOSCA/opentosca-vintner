import * as assert from '#assert'
import * as check from '#check'
import {Stats} from '#controller/utils/stats/utils'
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
    const stats = new Stats()

    /**
     * Models, LOC
     */
    const file = path.join(options.dir, 'playbook.yaml')
    const model = files.loadYAML<Playbook>(file)
    stats.models++
    stats.loc += files.countNotBlankLines(file)

    /**
     * No Inputs
     */

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
     * Relations (hosted on relations, conditional hosts count twice)
     */
    stats.relations += model.reduce((acc, play) => {
        const t = isTernary(play.hosts) ? 1 : 0
        return acc + (play.roles ?? []).length + t
    }, 0)

    /**
     * No Artifacts
     */

    /**
     * Conditions
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

    /**
     * Expressions (string interpolation in role names)
     */
    stats.expressions += model.reduce((acc, play) => {
        const roles = play.roles ?? []
        return (
            acc +
            roles.reduce<number>((bbc, role) => {
                if (isExpressions(role.role)) bbc++
                return bbc
            }, 0)
        )
    }, 0)

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.propagate()
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
    return check.isDefined(thing.when) ? 1 : 0
}

function countTernary(value: string) {
    return isTernary(value) ? 2 : 0
}

function isTernary(value: string) {
    return new RegExp(/\{\{.*if.*else.*}}/).test(value)
}

function isExpressions(value: string) {
    return new RegExp(/.*\{\{.*}}.*/).test(value)
}
