import path from 'path'

export const LIB_DIRECTORY = 'lib'
export const TMP_DIRECTORY = path.join('tmp', 'lib')
export const DEPENDENCY_FILE = 'dependencies'

export type Dependency = {
    dir: string
    repo: string
    checkout: string
}

export type Dependencies = Dependency[]
