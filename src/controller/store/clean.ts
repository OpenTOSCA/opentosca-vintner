import * as files from '#files'
import {Store} from '#repository/store'

export type StoreCleanOptions = {}

export default async function (options: StoreCleanOptions) {
    files.deleteDirectory(Store.getDirectory())
}
