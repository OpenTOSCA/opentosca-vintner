import open from '#utils/open'

export default async function () {
    const url = 'https://vintner.opentosca.org'
    console.log(url)
    await open.url(url)
}
