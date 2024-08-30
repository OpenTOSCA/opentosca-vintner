import Controller from '#controller'
import Loader from '#graph/loader'
import * as path from 'path'
import {renderProfile} from '../.utils/profile/utils'

async function main() {
    const dir = path.join('docs', 'docs', 'sofdcar')

    const coreName = 'tosca-sofdcar-profile-core'
    const coreFile = path.join(dir, coreName + '.yaml')
    const core = new Loader(coreFile).raw()
    await Controller.template.puml.types({path: coreFile})
    await renderProfile({name: coreName, id: 'c', profile: 'TOSCA SofDCar Core', dir, template: core})

    const extendedName = 'tosca-sofdcar-profile-extended'
    const extendedFile = path.join(dir, extendedName + '.yaml')
    const extended = new Loader(extendedFile).raw()
    await Controller.template.puml.types({path: extendedFile})
    await renderProfile({name: extendedName, id: 'e', profile: 'TOSCA SofDCar Extended', dir, template: extended})

    await Controller.template.puml.topology({path: path.join(dir, 'guides', 'location', 'service-template.yaml')})
    await Controller.template.puml.topology({path: path.join(dir, 'guides', 'zone', 'service-template.yaml')})
}

main()
