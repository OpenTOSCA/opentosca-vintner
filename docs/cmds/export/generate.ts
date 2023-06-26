import * as files from '#files'
import {sleep} from '#utils'
import dayjs from '#utils/day'
import console from 'console'
import * as path from 'path'
import puppeteer, {Browser, PDFOptions} from 'puppeteer'

type Job = {
    url: string
    name: string
}

const jobs: Job[] = [
    {
        url: 'https://vintner.opentosca.org/variability4tosca/specification',
        name: 'variability4tosca-01-motivation',
    },
    {
        url: 'https://vintner.opentosca.org/variability4tosca/specification',
        name: 'variability4tosca-02-specification',
    },
    {
        url: 'https://vintner.opentosca.org/variability4tosca/testing',
        name: 'variability4tosca-03-testing',
    },
    {
        url: 'https://vintner.opentosca.org/variability4tosca/feature-ide',
        name: 'variability4tosca-04-feature-ide',
    },
    {
        url: 'https://vintner.opentosca.org/queries4tosca/getting-started',
        name: 'queries4tosca-01-getting-started',
    },
    {
        url: 'https://vintner.opentosca.org/queries4tosca/specification',
        name: 'queries4tosca-02-specification',
    },
    {
        url: 'https://vintner.opentosca.org/sofdcar/profile',
        name: 'tosca-sofdcar-profile-01-profile',
    },
    {
        url: 'https://vintner.opentosca.org/sofdcar/guides/zone',
        name: 'tosca-sofdcar-profile-02-guides-zone',
    },
    {
        url: 'https://vintner.opentosca.org/sofdcar/guides/location',
        name: 'tosca-sofdcar-profile-03-guides-location',
    },
]

let browser: Browser
const dist = path.join(__dirname, '..', '..', '..', 'dist-docs')

async function run(job: Job) {
    console.log('Processing', job.url)

    const page = await browser.newPage()

    await page.emulateMediaType('screen')
    await page.setViewport({width: 1920, height: 1080})

    await page.goto(job.url, {waitUntil: 'networkidle2'})

    await sleep(1000)

    await page.addStyleTag({
        content: `
.md-header, .md-footer {
    display: none !important;
}`,
    })

    const config: PDFOptions = {
        path: path.join(dist, job.name + '-' + dayjs().format('YYYY-MM-DD') + '.pdf'),
        format: 'A4',
        scale: 0.7,
        preferCSSPageSize: true,
    }

    await page.pdf(config)
}

async function main() {
    files.removeDirectory(dist)
    files.createDirectory(dist)

    browser = await puppeteer.launch({headless: 'new'})
    await Promise.all(jobs.map(run))
    await browser.close()
}

main()
