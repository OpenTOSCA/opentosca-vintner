import {Shell} from '#shell'

export async function clone(repo: string, dir: string) {
    await new Shell().execute(['git', 'clone', repo, dir])
}

export async function checkout(checkout: string, dir: string) {
    await new Shell().execute(['git', '-c', 'advice.detachedHead=false', 'checkout', checkout], {
        cwd: dir,
    })
}
