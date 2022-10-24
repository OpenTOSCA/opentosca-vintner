
import { DEPENDENCY_FILE, LIB_DIRECTORY } from "./consts";
import { escapeRegExp } from "lodash"
const fs = require('fs')

/**
 * Returns full directory name: LIB_DIR/dependency_dir
 */
export function getFullDependencyDirectory(dependency: string): string {
    return LIB_DIRECTORY + "/" + dependency
}

/**
 * Replaces dots with slashes:
 * org.abc.module => org/abc/module
 */
export function domainToUrl(dir: string): string {
    return dir.replace(new RegExp(escapeRegExp("."), 'g'), "/")
}

/**
 * Check if given directory exists
 */
export function checkDirectoryExists(dir: string): boolean {
    return fs.existsSync(dir)
}

/**
 * Create lib directory if it does not exist
 */
export function createLibDirectory(): void {
    if(!checkDirectoryExists(LIB_DIRECTORY)) {
        console.log("Creating lib directory");        
        fs.mkdirSync(LIB_DIRECTORY)
    }
}

/**
 * Read the dependency file
 */
export function readDependencyFile() {
    return fs.readFileSync(DEPENDENCY_FILE)
}