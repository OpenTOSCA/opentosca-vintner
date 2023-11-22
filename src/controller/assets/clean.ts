import {Assets} from '#repositories/assets'
import * as files from '#files'

export type AssetsCleanOptions = {}

export default async function (options: AssetsCleanOptions) {
    files.deleteDirectory(Assets.getDirectory())
}
