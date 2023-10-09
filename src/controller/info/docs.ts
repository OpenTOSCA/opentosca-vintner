import std from '#std'
import open from '#utils/open'

export default async function () {
    const url = 'https://vintner.opentosca.org'
    std.out(url)
    await open.url(url)
}
