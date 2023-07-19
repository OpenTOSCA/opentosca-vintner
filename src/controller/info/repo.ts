import open from '#utils/open'

export default async function () {
    const url = 'https://github.com/OpenTOSCA/opentosca-vintner'
    console.log(url)
    await open.url(url)
}
