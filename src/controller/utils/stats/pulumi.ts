import * as assert from '#assert'
import * as check from '#check'
import * as Stats from '#controller/utils/stats/stats'
import * as files from '#files'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import * as TS from '@typescript-eslint/parser'
import * as ESQuery from 'esquery'
import * as ESTree from 'estree'
import path from 'path'

export type StatsPulumiOptions = {
    dir: string
    experimental: boolean
}

export default async function (options: StatsPulumiOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    /**
     * Pulumi.yaml
     */
    const configFile = path.join(options.dir, 'Pulumi.yaml')
    const config = files.loadYAML<ConfigFile>(configFile)

    /**
     * AST
     */
    const codeFile = path.join(options.dir, 'model.ts')
    const AST = TS.parse(files.loadFile(codeFile), {})

    /**
     * Stats
     */
    const stats = new Stats.Builder('Pulumi')

    /**
     * Models
     */
    stats.models++
    stats.models++

    /**
     * LOC
     */
    stats.loc += files.countNotBlankLines(configFile)
    stats.loc += files.countNotBlankLines(codeFile)

    /**
     * Inputs
     */
    stats.inputs += Object.keys(config.config).filter(Stats.isNotFeature).length

    /**
     * No Outputs
     */

    /**
     * Components
     */
    stats.components += ESQuery.query(AST as any, 'NewExpression[callee.object.name="lib"]').length

    /**
     * Properties
     */
    stats.properties += utils.sum(
        ESQuery.query(AST as any, 'NewExpression[callee.object.name="lib"] > :nth-child(2)').map(it => {
            const object = it as any as ESTree.ObjectExpression
            return object.properties.length
        })
    )

    /**
     * Relations
     */
    ESQuery.query(AST as any, 'Property[key.name="dependsOn"]').forEach(it => {
        const property = it as any as ESTree.Property
        const value = property.value
        if (value.type !== 'ArrayExpression') throw new UnexpectedError()
        stats.relations += value.elements.length
    })

    /**
     * No Artifacts
     */

    /**
     * No Technologies
     */

    /**
     * Conditions
     */
    ESQuery.query(AST as any, 'IfStatement').forEach(it => {
        const statement = it as any as ESTree.IfStatement
        stats.conditions += Stats.Weights.if_then
        if (check.isDefined(statement.alternate)) stats.conditions += Stats.Weights.if_else
    })
    stats.conditions += ESQuery.query(AST as any, 'ConditionalExpression').length * Stats.Weights.ternary

    /**
     * Expressions (feature deployment inputs as variability inputs)
     */
    stats.expressions += Object.keys(config.config).filter(Stats.isFeature).length

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.build()
}

type ConfigFile = {
    name: string
    runtime: string
    config: {[key: string]: any}
}
