import {Templates} from '#repositories/templates'
import * as files from '#files'

export type TemplatesCleanOptions = {}

export default async function (options: TemplatesCleanOptions) {
    files.deleteDirectory(Templates.getTemplatesDirectory())
}
