export const UNKNOWN = 'UNKNOWN'

export type Dependency = {
    name: string
    version: string
    license: string
    url: string
}

export type DependencyList = Dependency[]

export type CheckerEntry = {
    licenses: string
    repository?: string
    name: string
    version: string
}

export type CheckerEntryList = CheckerEntry[]
