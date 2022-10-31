import Papa from 'papaparse'
import * as fs from 'fs'
import semver from 'semver'
import {Dependencies, Dependency} from './types'

export const LICENSES: {[key: string]: string} = {
    'Apache-2.0': 'https://www.apache.org/licenses/LICENSE-2.0',
    'BSD-2-Clause': 'https://opensource.org/licenses/BSD-2-Clause',
    'BSD-3-Clause': 'https://opensource.org/licenses/BSD-3-Clause',
    MIT: 'https://opensource.org/licenses/MIT',
    ISC: 'https://opensource.org/licenses/ISC',
    'Python-2.0': 'https://opensource.org/licenses/Python-2.0',
    '0BSD': 'https://opensource.org/licenses/0BSD',
    'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0',
    'CC-BY-3.0': 'https://creativecommons.org/licenses/by/3.0/',
    'BSD*': '',
}

/**
 * Read latest list from CSV file
 */
export function readLatestList(path: string): Dependencies {
    let data: Dependencies = []
    if (fs.existsSync(path)) {
        data = Papa.parse<Dependency>(fs.readFileSync(path, 'utf8'), {skipEmptyLines: true, header: true}).data
        console.log('Latest list read. It has ', data.length, ' Entries')
    } else {
        console.log('No file for dependencies found. A new one will be created later')
    }
    return data
}

/**
 * Writes csv data to file
 */
export function storeData(data: Dependencies, file: string): void {
    fs.writeFileSync(file, Papa.unparse(data))
    console.log('File ', file, ' written')
}

/**
 * Sort by name and version
 */
export function sortData(data: Dependencies): void {
    data.sort((a, b) => a.name.localeCompare(b.name) || semver.compare(b.version, a.version))
}

/**
 * Prune older version if a newer version with the same license exists
 */
export function prunePastVersionsWithSameLicense(data: Dependencies): void {
    sortData(data)

    data.forEach((entry, index) => {
        for (let successorIndex = index + 1; successorIndex < data.length; successorIndex++) {
            const successorEntry: Dependency = data[successorIndex]

            // Stop when exceeding name order in sorted list
            if (successorEntry.name.localeCompare(entry.name) == 1) break

            // Third condition of lower version number implicit because of sorting
            if (successorEntry.name == entry.name && successorEntry.licenseName == entry.licenseName) {
                console.log(
                    'Removing',
                    successorEntry.name,
                    '@',
                    successorEntry.version,
                    'because of version',
                    entry.version
                )
                data.splice(successorIndex, 1)
                successorIndex--
            }
        }
    })
}

/**
 * Formats the given URL as follows:
 * https://domain.com/...
 */
export function formatSourceCodeUrl(url: string): string {
    if (url.endsWith('.git')) url = url.slice(0, -4)
    if (url.startsWith('http')) return url
    if (url.startsWith('git://')) return url.replace('git://', 'https://')
    if (url.startsWith('git+ssh://git@')) return url.replace('git+ssh://git@', 'https://')
    if (url.startsWith('git+')) return url.slice(4)
    if (url.startsWith('git@')) return url.replace(':', '/').replace('git@', 'https://')

    console.log(`Unsupported source code url ${url}`)
    return url
}

/**
 * Return string with license URL(s) from license name
 */
export function getLicenseUrlFromName(licenseName: string): string {
    let licenseUrl = ''
    if (licenseName in LICENSES) {
        licenseUrl = LICENSES[licenseName]
    } else {
        licenseName.split(' ').forEach(license => {
            if (license.match('OR')) return
            if (license.match('AND')) return
            if (license.startsWith('(')) license = license.substring(1)
            else if (license.endsWith(')')) license = license.substring(0, license.length - 1)

            licenseUrl += LICENSES[license] + ' '
        })
    }
    return licenseUrl.trimEnd()
}

/**
 * Format license name, useful for multi-licensing
 */
export function formatLicenseName(licenseName: string): string {
    let formattedName = ''
    licenseName.split(' ').forEach(license => {
        if (license.startsWith('(')) license = license.substring(1)
        else if (license.endsWith(')')) license = license.substring(0, license.length - 1)

        formattedName += license + ' '
    })
    return formattedName.trimEnd()
}
