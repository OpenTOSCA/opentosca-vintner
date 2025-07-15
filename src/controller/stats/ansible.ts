import * as assert from '#assert'
import * as check from '#check'
import * as Stats from '#controller/stats/stats'
import * as files from '#files'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
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
    const args = collectArgs(files.loadYAML<ArgumentSpecs>(argsFile))
    stats.files++
    stats.loc += files.countNotBlankLines(argsFile)

    const modelFile = path.join(options.dir, 'playbook.yaml')
    const model = files.loadYAML<Playbook>(modelFile)
    stats.files++
    stats.loc += files.countNotBlankLines(modelFile)

    const hostVars: Vars[] = []
    const hostVarDir = path.join(options.dir, 'host_vars')
    if (files.isDirectory(hostVarDir)) {
        for (const host of files.walkDirectory(hostVarDir)) {
            stats.files += hostVars.length
            stats.loc += files.countNotBlankLines(host)
            hostVars.push(files.loadYAML<Vars>(host))
        }
    }

    /**
     * Inputs
     */
    stats.inputs += Object.keys(args).filter(Stats.isNotFeature).length

    /**
     * No Outputs
     */

    /**
     * Components (roles, plays, tasks)
     */
    stats.components += utils.sum(model.map(play => (play.roles ?? []).length + getBlock(play).length)) + model.length

    /**
     * Properties
     */
    stats.properties += utils.sum(model.map(play => collectVars(play).map(it => Object.keys(it).length)).flat())
    stats.properties += utils.sum(hostVars.map(it => Object.values(it).length))

    /**
     * No Relations
     */

    /**
     * No Artifacts
     */

    /**
     * No Technologies (counted as properties ...)
     */

    /**
     * Conditions (ternaries, when, input descriptions)
     */
    stats.conditions += utils.sum(
        model.map(play => {
            const roles = play.roles ?? []
            const block = utils.isPopulated(play.tasks) ? utils.first(play.tasks!) : undefined

            // Ternary in hosts
            const countedHosts = countTernary(play.hosts)

            // Count in play, roles, or blocks
            const countedWhens = countWhen(play) + utils.sum(roles.map(role => countWhen(role))) + countWhen(block)

            // Ternary in vars
            const countedVars = utils.sum(
                collectVars(play).map(vars => {
                    return utils.sum(
                        Object.values(vars).map(value => (check.isString(value) ? countTernary(value) : 0))
                    )
                })
            )

            return countedHosts + countedWhens + countedVars
        })
    )
    stats.conditions += Object.keys(args)
        .filter(Stats.isNotFeature)
        .filter(it => check.isDefined(args[it].description) || check.isDefined(args[it].required)).length

    /**
     * Expressions (string interpolation in role names, variability inputs)
     */
    stats.expressions += utils.sum(
        model.map(play => utils.sum((play.roles ?? []).map(role => countExpressions(role.role))))
    )
    stats.expressions += Object.keys(args).filter(Stats.isFeature).length

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.build()
}

function collectVars(play: Play): Vars[] {
    const vars: Vars[] = []

    if (check.isDefined(play.vars)) {
        vars.push(play.vars)
    }

    if (check.isDefined(play.roles)) {
        vars.push(...play.roles.map(it => it.vars ?? {}))
    }

    if (check.isDefined(play.tasks)) {
        const tasks = getBlock(play)
        vars.push(...tasks.map(it => it.vars ?? {}))
    }

    return vars
}

function getBlock(play: Play): Task[] {
    if (check.isDefined(play.tasks)) {
        const tasks = utils.first(play.tasks).block
        assert.isDefined(tasks)
        return tasks
    }
    return []
}

function collectArgs(spec: ArgumentSpecs): Options {
    const options: Options = {}

    Object.entries(spec.argument_specs.playbook.options).forEach(option => {
        if (Object.hasOwn(options, option[0])) throw new UnexpectedError()
        options[option[0]] = option[1]

        Object.entries(option[1].options ?? {}).forEach(sub => {
            if (Object.hasOwn(options, sub[0])) throw new UnexpectedError()
            options[sub[0]] = sub[1]
        })
    })

    return options
}

type ArgumentSpecs = {
    argument_specs: {
        playbook: {
            options: Options
        }
    }
}

type Options = {[key: string]: Option}

type Option = {
    type: string
    description?: string
    required?: boolean
    options?: Options
}

type Playbook = Play[]

type Play = {
    hosts: string
    when?: string
    vars?: Vars
    roles?: Role[]
    tasks?: Task[]
}

type Task = {
    when?: string
    vars?: Vars
    block?: Task[]
}

type Role = {
    role: string
    when?: string
    vars?: Vars
}

type Vars = {
    [key: string]: string | number | boolean | string[] | number[] | boolean[]
}

function countWhen(thing?: {when?: string}) {
    if (check.isUndefined(thing)) return 0
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
