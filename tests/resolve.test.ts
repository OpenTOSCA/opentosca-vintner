import {getDefaultTest} from './utils'

it('node', getDefaultTest({}))
it('requirement-assignment', getDefaultTest({}))
it('groups', getDefaultTest({}))
it('nothing', getDefaultTest({}))
it('preset', getDefaultTest({preset: 'two'}))
it('tosca-definitions-version', getDefaultTest({}))
it('relationship', getDefaultTest({}))
it(
    'relationship-throw-undefined',
    getDefaultTest({error: 'Relationship "rthree" of relation "three" of node "two" does not exist!'})
)
it('relationship-throw-unused', getDefaultTest({error: 'Relationship "rthree" is never used'}))
