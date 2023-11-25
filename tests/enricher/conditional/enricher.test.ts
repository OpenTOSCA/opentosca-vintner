import path from 'path'
import {EnricherTest} from '../utils'

describe('enricher', () => {
    EnricherTest(path.basename(__dirname))
})
