import * as files from '#files'
import {Templates} from '#repositories/templates'

export type TemplatesCleanOptions = {}

export default async function (options: TemplatesCleanOptions) {
    files.removeDirectory(Templates.getTemplatesDirectory())
}
