import {Shell} from '#shell'

export async function clone(repo: string, dir: string) {
    await new Shell().execute(['git', 'clone', repo, dir])
}

export async function checkout(target: string, dir: string) {
    await new Shell().execute(['git', '-c', 'advice.detachedHead=false', 'checkout', target], {
        cwd: dir,
    })
}
