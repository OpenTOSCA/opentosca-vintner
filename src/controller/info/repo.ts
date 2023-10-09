import std from '#std'
import open from '#utils/open'

export default async function () {
    const url = 'https://github.com/OpenTOSCA/opentosca-vintner'
    std.out(url)
    await open.url(url)
}
