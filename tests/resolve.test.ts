import {getDefaultTest} from './utils'

it('node', getDefaultTest({}))
it('node-prune', getDefaultTest({pruneNodes: true}))
it('node-prune-nothing', getDefaultTest({pruneNodes: true}))
it('node-prune-throw', getDefaultTest({pruneNodes: true}))
it('node-prune-force', getDefaultTest({forcePruneNodes: true}))
it('node-prune-combined', getDefaultTest({pruneRelations: true, pruneNodes: true}))

it('requirement-assignment', getDefaultTest({}))
it('requirement-assignment-prune', getDefaultTest({pruneRelations: true}))
it(
    'requirement-assignment-prune-throw',
    getDefaultTest({pruneRelations: true, error: 'Relation source "one" of relation "two" does not exist'})
)
it('requirement-assignment-prune-force', getDefaultTest({forcePruneRelations: true}))

it('groups', getDefaultTest({}))

it('nothing', getDefaultTest({}))

it('policy', getDefaultTest({}))

it('preset', getDefaultTest({preset: 'two'}))

it('tosca-definitions-version', getDefaultTest({}))

it('relationship', getDefaultTest({}))

it(
    'relationship-throw-undefined',
    getDefaultTest({error: 'Relationship "rthree" of relation "three" of node "two" does not exist!'})
)
it('relationship-throw-unused', getDefaultTest({error: 'Relationship "rthree" is never used'}))

it(
    'consistency-throw-relation-source-missing',
    getDefaultTest({error: 'Relation target "two" of relation "two" does not exist'})
)

it(
    'consistency-throw-multiple-hosting-relations',
    getDefaultTest({error: 'Node "one" has more than one hosting relations'})
)

it('consistency-throw-hosting-relation-missing', getDefaultTest({error: 'Node "one" requires a hosting relation'}))

it('examples-opera-getting-started-first', getDefaultTest({example: 'opera-getting-started'}))

it('examples-opera-getting-started-second', getDefaultTest({example: 'opera-getting-started'}))

it('examples-opera-motivation-dev', getDefaultTest({preset: 'dev', example: 'opera-motivation'}))

it('examples-opera-motivation-prod', getDefaultTest({preset: 'prod', example: 'opera-motivation'}))

it('examples-unfurl-motivation-dev', getDefaultTest({preset: 'dev', example: 'unfurl-motivation'}))

it('examples-unfurl-motivation-prod', getDefaultTest({preset: 'prod', example: 'unfurl-motivation'}))

it('one-hosting-relation', getDefaultTest({}))

it('topology-template-inputs', getDefaultTest({}))
