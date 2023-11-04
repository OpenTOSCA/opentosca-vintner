import {Keystore} from '#repository/keystore'

export default async function () {
    return Keystore.all()
}
