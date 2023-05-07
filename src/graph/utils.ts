import Element from '#graph/element'

export function bratanize(bratans: Element[]) {
    return {
        not: {
            or: bratans.map(it => it.presenceCondition),
        },
    }
}
