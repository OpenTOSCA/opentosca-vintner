/**
 * This script gathers the licences from all dependencies
 * and stores information in a CSV file.
 * At the same time the documentation page is generated.
 */
import * as files from '#files'
import * as path from 'path'
import * as utils from './utils'

const CSV_FILE = path.join('docs', 'docs', 'assets', 'documents', 'licenses.csv')

async function main() {
    /**
     * Read current dependencies
     */
    const dependencies = await utils.gatherFromLicenseChecker()
    console.log('Current dependencies retrieved. There are ', dependencies.length, ' Entries')

    /**
     * Remove older version if a newer version with the same license exists
     */
    utils.removeDependencyVersionsWithSameLicense(dependencies)

    /**
     * Write list to file
     */
    console.log('Store CSV')
    utils.storeData(dependencies, CSV_FILE)

    /**
     * Generate documentation page for dependency table
     */
    await files.renderFile(
        path.join(__dirname, 'template.ejs'),
        {data: dependencies, licenses: utils.LICENSES},
        path.join('docs', 'docs', 'dependencies.md')
    )
    console.log('Documentation page generated')
}

main()
