import * as files from '#files'
import {Templates} from '#repository/templates'

export type TemplatesCleanOptions = {}

export default async function (options: TemplatesCleanOptions) {
    files.deleteDirectory(Templates.getTemplatesDirectory())
}
