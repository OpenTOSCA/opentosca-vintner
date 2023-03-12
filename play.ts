import Logic, {Solver} from 'logic-solver'

/**
 * Application is true, thus, only one solution is possible ...
 */

function one() {
    const solver = new Logic.Solver()

    solver.require(Logic.implies('VM', 'Promtail'))
    solver.require(Logic.equiv('Promtail', 'Promtail-->VM'))

    solver.require(Logic.implies('VM', 'Telegraf'))
    solver.require(Logic.equiv('Telegraf', 'Telegraf-->VM'))

    solver.require('Application')
    solver.require(Logic.equiv('Application', 'Application-->VM'))

    solver.require(Logic.implies(Logic.or('Promtail', 'Telegraf', 'Application'), 'VM'))

    console.log(solver)
    return solver
}

solve(one())
//optimize(one())

/**
 * Application is false, thus, two solutions are possible ...
 */
function two() {
    const solver = new Logic.Solver()
    solver.require(Logic.implies('VM', 'Promtail'))
    solver.require(Logic.equiv('Promtail', 'Promtail-->VM'))

    solver.require(Logic.implies('VM', 'Telegraf'))
    solver.require(Logic.equiv('Telegraf', 'Telegraf-->VM'))

    solver.require('-Application')
    solver.require(Logic.equiv('Application', 'Application-->VM'))

    solver.require(Logic.implies(Logic.or('Promtail', 'Telegraf', 'Application'), 'VM'))
    return solver
}

//solve(two())
//optimize(two())

/**
 * Optimize
 */
function optimize(solver: Solver) {
    const solution = solver.solve()
    if (!solution) return console.log('No solution found')
    console.log('initial')
    console.log(solution.getMap())

    // TODO: get node names
    const optimized = solver.minimizeWeightedSum(solution, ['VM', 'Promtail', 'Telegraf', 'Application'], 1)
    console.log('optimized')
    if (!optimized) return console.log('No solution found')
    console.log(optimized.getMap())
    console.log('-------------------------------------------')
}

/**
 * Solve all
 */
function solve(solver: Solver) {
    const solutions = []
    let next
    while ((next = solver.solve())) {
        console.log(next.getMap())
        solutions.push(next.getTrueVars())
        solver.forbid(next.getFormula())
    }
    console.log('-------------------------------------------')
}
