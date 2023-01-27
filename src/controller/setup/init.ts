import * as files from '#files'
import config from '#config'
import {Templates} from '#repository/templates'
import {Instances} from '#repository/instances'
import Plugins from '#plugins'

export default async function () {
    files.createDirectory(config.home)
    files.createDirectory(Templates.getTemplatesDirectory())
    files.createDirectory(Instances.getInstancesDirectory())
    Plugins.setConfig({})
}
