export const UNKNOWN = 'UNKNOWN'

export type Dependency = {
    name: string
    version: string
    licenseName: string
    environment: string
    licenseURL: string
    sourceCodeURL: string
}

export type Dependencies = Dependency[]

export type ReaderDataEntry = {
    name: string
    version: string
    license: string
    URL?: string
}

export type ReaderData = ReaderDataEntry[]

export type CheckerEntry = {
    licenses: string
    repository?: string
    name: string
    version: string
}

export type CheckerEntries = CheckerEntry[]
