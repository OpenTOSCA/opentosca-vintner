import * as files from '#files'
import {Keystore} from '#repository/keystore'

export type KeysCleanOptions = {}

export default async function (options: KeysCleanOptions) {
    files.deleteDirectory(Keystore.getKeystoreDirectory())
}
