/**
 * This script gathers the licences from all dependencies
 * and stores information in a CSV file.
 * At the same time the documentation page is generated.
 */
import * as path from 'path'
import * as reader from './reader'
import * as utils from './utils'
import {Dependencies} from './types'
import {LICENSES} from './utils'
import {renderFile} from '../utils'

const CSV_FILE = path.join('docs', 'docs', 'assets', 'documents', 'licenses.csv')

async function main() {
    /**
     * Read latest list of all dependencies
     */
    const knownDependencies: Dependencies = utils.readLatestList(CSV_FILE)

    /**
     * Read current dependencies
     */
    const currentDependencies = await reader.gatherFromLicenseChecker()
    console.log('Current dependencies retrieved. There are ', currentDependencies.length, ' Entries')

    /**
     * Create list with unknown dependencies
     */
    console.log('Create list with unknown dependencies')
    const unknownDependencies: Dependencies = currentDependencies
        .filter(
            currentDependency =>
                knownDependencies.findIndex(
                    knownDependency =>
                        knownDependency.name === currentDependency.name &&
                        knownDependency.licenseName === currentDependency.license &&
                        knownDependency.version === currentDependency.version
                ) === -1
        )
        .map(currentDependency => {
            return {
                name: currentDependency.name,
                version: currentDependency.version,
                licenseName: utils.formatLicenseName(currentDependency.license),
                environment: 'Standalone',
                licenseURL: utils.getLicenseUrlFromName(currentDependency.license),
                sourceCodeURL: utils.formatSourceCodeUrl(currentDependency.URL ?? ''),
            }
        })

    /**
     * Merge new and latest list
     */
    const allDependencies = [...knownDependencies, ...unknownDependencies]

    /**
     * Prune older version if a newer version with the same license exists
     */
    utils.prunePastVersionsWithSameLicense(allDependencies)
    console.log('Added dependencies to the list:', allDependencies.length - knownDependencies.length)

    /**
     * Write list to file
     */
    console.log('Store CSV')
    utils.storeData(allDependencies, CSV_FILE)

    /**
     * Generate documentation page for dependency table
     */
    const data = allDependencies.map(dependency => {
        return {
            name: dependency.name,
            version: dependency.version,
            url: dependency.sourceCodeURL,
            license: dependency.licenseName.split(' '),
            licenseUrl: dependency.licenseURL.split(' '),
        }
    })

    await renderFile(
        path.join(__dirname, 'template.ejs'),
        {data, licenses: LICENSES},
        path.join('docs', 'docs', 'dependencies.md')
    )
    console.log('Documentation page generated')
}

main()
