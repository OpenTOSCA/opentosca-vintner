import {METADATA} from '#/technologies/plugins/rules/types'

export function MetadataNormative() {
    return {[METADATA.VINTNER_NORMATIVE]: 'true'}
}

export function MetadataAbstract() {
    return {[METADATA.VINTNER_ABSTRACT]: 'true'}
}

export function MetadataIgnore() {
    return {[METADATA.VINTNER_IGNORE]: 'true'}
}

export function MetadataName(name: string) {
    return {[METADATA.VINTNER_NAME]: name}
}

export function MetadataUnfurl() {
    return {[METADATA.VINTNER_ORCHESTRATOR]: 'unfurl'}
}
