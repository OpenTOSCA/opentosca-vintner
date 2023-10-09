import std from '#std'
import open from '#utils/open'

export default async function () {
    const url = 'https://miles.stoetzner.de'
    std.out(url)
    await open.url(url)
}
