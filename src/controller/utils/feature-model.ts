import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import MiniSat from 'logic-solver'

export type FeatureModelOptions = {
    path: string
}

export default async function (options: FeatureModelOptions) {
    assert.isDefined(options.path, 'Path not defined')

    const model = files.loadYAML<FeatureModel>(options.path)

    const minisat = new MiniSat.Solver()
    minisat.require(model.features.name)
    walkFeature(model.features, minisat)

    const solutions: MiniSat.Solution[] = []
    let solution: MiniSat.Solution | null
    while ((solution = minisat.solve())) {
        solutions.push(solution)
        minisat.forbid(solution.getFormula())
    }

    return solutions
        .map(it => {
            return {
                id: Object.entries(it.getMap())
                    .map(([k, v]) => (v ? k : null))
                    .filter(name => check.isDefined(name))
                    .join('---'),
                map: it.getMap(),
            }
        })
        .sort((a, b) => a.id.localeCompare(b.id))
}

function walkFeature(feature: Feature, minisat: MiniSat.Solver) {
    if (check.isDefined(feature.mandatory)) {
        feature.mandatory.forEach(child => {
            minisat.require(MiniSat.equiv(child.name, feature.name))
            walkFeature(child, minisat)
        })
    }

    if (check.isDefined(feature.optional)) {
        feature.optional.forEach(child => {
            minisat.require(MiniSat.implies(child.name, feature.name))
            walkFeature(child, minisat)
        })
    }

    if (check.isDefined(feature.or)) {
        minisat.require(MiniSat.equiv(MiniSat.or(...feature.or.map(it => it.name)), feature.name))
        feature.or.forEach(child => walkFeature(child, minisat))
    }

    if (check.isDefined(feature.alternative)) {
        minisat.require(MiniSat.equiv(MiniSat.exactlyOne(...feature.alternative.map(it => it.name)), feature.name))
        feature.alternative.forEach(child => walkFeature(child, minisat))
    }
}

type FeatureModel = {
    features: Feature
    constraints: Constraint[]
}

type Feature = {
    name: string
    mandatory?: Feature[]
    optional?: Feature[]
    or?: Feature[]
    alternative?: Feature[]
}

// TODO: constraints
type Constraint = {}
