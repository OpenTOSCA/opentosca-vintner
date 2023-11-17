import config from '#config'
import * as files from '#files'
import Plugins from '#plugins'
import {Instances} from '#repository/instances'
import {Store} from '#repository/store'
import {Templates} from '#repository/templates'

export default async function () {
    files.createDirectory(config.home)
    files.createDirectory(Templates.getTemplatesDirectory())
    files.createDirectory(Instances.getInstancesDirectory())
    files.createDirectory(Store.getDirectory())
    Plugins.setConfig({})
}
