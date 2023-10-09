import std from '#std'
import open from '#utils/open'

export default async function () {
    const url = 'mailto://miles.stoetzner@iste.uni-stuttgart.de'
    std.out(url)
    await open.url(url)
}
