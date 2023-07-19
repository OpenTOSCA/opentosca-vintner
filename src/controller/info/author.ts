import open from '#utils/open'

export default async function () {
    const url = 'https://miles.stoetzner.de'
    console.log(url)
    await open.url(url)
}
