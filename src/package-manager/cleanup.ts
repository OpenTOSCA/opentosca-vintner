import { exec } from 'child_process'
import clean from '../controller/setup/clean'
import { LIB_DIRECTORY, DEPENDENCY_FILE } from './consts'

function main() {
    cleanup()
}

export function cleanup() {
    exec(`rm -rf ${LIB_DIRECTORY}/*`)
}

main()