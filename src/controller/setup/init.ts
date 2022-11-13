import * as files from '#files'
import config from '#config'
import {Templates} from '#repository/templates'
import {Instances} from '#repository/instances'
import {Orchestrators} from '#repository/orchestrators'

export default async function () {
    files.createDirectory(config.home)
    files.createDirectory(Templates.getTemplatesDirectory())
    files.createDirectory(Instances.getInstancesDirectory())
    Orchestrators.setConfig({})
}
