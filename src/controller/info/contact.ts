import open from '#utils/open'

export default async function () {
    const url = 'mailto://miles.stoetzner@iste.uni-stuttgart.de'
    console.log(url)
    await open.url(url)
}
