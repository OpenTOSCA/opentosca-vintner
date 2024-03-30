/**
 * This script gathers the licences from all dependencies
 * and stores information in a CSV file.
 * At the same time the documentation page is generated.
 */
import * as files from '#files'
import std from '#std'
import * as path from 'path'

const SOURCE = path.join('build', 'assets', 'dependencies.csv')

const TARGET_CSV = path.join('docs', 'docs', 'assets', 'documents', 'dependencies.csv')
const TARGET_MD = path.join('docs', 'docs', 'dependencies.md')
const TEMPLATE = path.join(__dirname, 'template.ejs')

async function main() {
    /**
     * Copy dependencies
     */
    files.copy(SOURCE, TARGET_CSV)

    /**
     * Current dependencies
     */
    const dependencies = files
        .loadFile(SOURCE)
        .split(/\r?\n/)
        .filter(it => it != '')
        .map(it => it.split(',').map(it => it.slice(1, -1)))
        .slice(1)

    /**
     * Generate documentation page for dependency table
     */
    await files.renderFile(TEMPLATE, {data: dependencies}, TARGET_MD)
    std.log('Documentation page generated')
}

main()
