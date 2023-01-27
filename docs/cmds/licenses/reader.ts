/**
 * This script gathers the licences from all dependencies
 */

import {execSync} from 'child_process'
import * as path from 'path'
import * as licenseChecker from 'license-checker'
import {CheckerEntries, ReaderData, UNKNOWN} from './types'

/**
 * Gather dependencies with `yarn licenses`
 */
export async function gatherFromYarnLicenses(production = true): Promise<ReaderData> {
    return new Promise((resolve, reject) => {
        const yarnOutput = execSync('yarn licenses ls --json' + (production ? ' --prod' : ''))
            .toString()
            .split('\n')
        const dataCurrent: ReaderData = JSON.parse(yarnOutput[yarnOutput.length - 2]).data.body.map(
            (entry: string[]) => ({
                name: entry[0],
                version: entry[1] || UNKNOWN,
                license: entry[2] || UNKNOWN,
                URL: entry[3],
            })
        )
        resolve(dataCurrent)
    })
}

/**
 * Gather dependencies with the license-checker library
 */
export async function gatherFromLicenseChecker(production = true): Promise<ReaderData> {
    return new Promise((resolve, reject) => {
        licenseChecker.init(
            {
                start: path.join(),
                production,
                unknown: true,
                customPath: path.join(__dirname, 'licenseCheckerFormat.json'),
            },
            function (error, packages) {
                if (error) return reject(error)
                const data: ReaderData = (Object.values(packages) as CheckerEntries).map(entry => ({
                    name: entry.name,
                    version: entry.version ?? UNKNOWN,
                    license: entry.licenses ?? UNKNOWN,
                    URL: entry.repository ?? '',
                }))
                resolve(data)
            }
        )
    })
}
