import std from '#std'
import {execSync} from 'child_process'
import * as fs from 'fs'
import * as licenseChecker from 'license-checker'
import Papa from 'papaparse'
import path from 'path'
import semver from 'semver'
import {CheckerEntryList, Dependency, DependencyList, UNKNOWN} from './types'

export const LICENSES: {[key: string]: string} = {
    'Apache-2.0': 'https://choosealicense.com/licenses/apache-2.0',
    'BSD-2-Clause': 'https://choosealicense.com/licenses/bsd-2-clause',
    'BSD-3-Clause': 'https://choosealicense.com/licenses/bsd-3-clause',
    MIT: 'https://choosealicense.com/licenses/mit',
    ISC: 'https://choosealicense.com/licenses/isc',
    'Python-2.0': 'https://opensource.org/licenses/Python-2.0',
    '0BSD': 'https://choosealicense.com/licenses/0bsd',
    'CC0-1.0': 'https://choosealicense.com/licenses/cc0-1.0',
    'CC-BY-3.0': 'https://creativecommons.org/licenses/by/3.0/',
    PSF: 'http://docs.python.org/license.html',
    'BlueOak-1.0.0': 'https://blueoakcouncil.org/license/1.0.0',
}

/**
 * Gather dependencies with `yarn licenses`
 */
export async function gatherFromYarnLicenses(production = true): Promise<DependencyList> {
    return new Promise((resolve, reject) => {
        const yarnOutput = execSync('yarn licenses ls --json' + (production ? ' --prod' : ''))
            .toString()
            .split('\n')
        const dataCurrent: DependencyList = JSON.parse(yarnOutput[yarnOutput.length - 2]).data.body.map(
            (entry: string[]) => ({
                name: entry[0],
                version: entry[1] || UNKNOWN,
                license: entry[2] || UNKNOWN,
                url: formatSourceCodeUrl(entry[3]),
            })
        )
        resolve(dataCurrent)
    })
}

/**
 * Gather dependencies with the license-checker library
 */
export async function gatherFromLicenseChecker(production = true): Promise<DependencyList> {
    return new Promise((resolve, reject) => {
        licenseChecker.init(
            {
                start: path.join(),
                production,
                unknown: true,
                customPath: path.join(__dirname, 'license-checker-format.json'),
            },
            function (error, packages) {
                if (error) return reject(error)
                const data: DependencyList = (Object.values(packages) as CheckerEntryList).map(entry => ({
                    name: entry.name,
                    version: entry.version ?? UNKNOWN,
                    license: entry.licenses ?? UNKNOWN,
                    url: formatSourceCodeUrl(entry.repository ?? ''),
                }))
                resolve(data)
            }
        )
    })
}

/**
 * Read latest list from CSV file
 */
export function readLatestList(path: string): DependencyList {
    let data: DependencyList = []
    if (fs.existsSync(path)) {
        data = Papa.parse<Dependency>(fs.readFileSync(path, 'utf8'), {skipEmptyLines: true, header: true}).data
        std.log('Latest list read. It has ', data.length, ' Entries')
    } else {
        std.log('No file for dependencies found. A new one will be created later')
    }
    return data
}

/**
 * Writes csv data to file
 */
export function storeData(data: DependencyList, file: string): void {
    fs.writeFileSync(file, Papa.unparse(data))
    std.log('File ', file, ' written')
}

/**
 * Sort by name and version
 */
export function sortData(data: DependencyList): void {
    data.sort((a, b) => a.name.localeCompare(b.name) || semver.compare(b.version, a.version))
}

/**
 * Remove older version if a newer version with the same license exists
 */
export function removeDependencyVersionsWithSameLicense(data: DependencyList): void {
    sortData(data)

    data.forEach((entry, index) => {
        for (let successorIndex = index + 1; successorIndex < data.length; successorIndex++) {
            const successorEntry: Dependency = data[successorIndex]

            // Stop when exceeding name order in sorted list
            if (successorEntry.name.localeCompare(entry.name) == 1) break

            // Third condition of lower version number implicit because of sorting
            if (successorEntry.name == entry.name && successorEntry.license == entry.license) {
                std.log(
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

    std.log(`Unsupported source code url ${url}`)
    return url
}
