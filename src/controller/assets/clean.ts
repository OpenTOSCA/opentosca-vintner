import * as files from '#files'
import {Assets} from '#repositories/assets'

export type AssetsCleanOptions = {}

export default async function (options: AssetsCleanOptions) {
    files.removeDirectory(Assets.getDirectory())
}
