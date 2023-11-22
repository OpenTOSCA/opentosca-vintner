import config from '#config'
import * as files from '#files'
import Plugins from '#plugins'
import {Assets} from '#repositories/assets'
import {Instances} from '#repositories/instances'
import {Templates} from '#repositories/templates'

export default async function () {
    files.createDirectory(config.home)
    files.createDirectory(Templates.getTemplatesDirectory())
    files.createDirectory(Instances.getInstancesDirectory())
    files.createDirectory(Assets.getDirectory())
    Plugins.setConfig({})
}
