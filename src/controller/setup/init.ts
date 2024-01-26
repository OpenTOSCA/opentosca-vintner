import config from '#config'
import * as files from '#files'
import {Assets} from '#repositories/assets'
import {Instances} from '#repositories/instances'
import {Templates} from '#repositories/templates'
import env from '#utils/env'

export default async function () {
    files.createDirectory(env.home)
    files.createDirectory(Templates.getTemplatesDirectory())
    files.createDirectory(Instances.getInstancesDirectory())
    files.createDirectory(Assets.getDirectory())
    config.set({})
}
