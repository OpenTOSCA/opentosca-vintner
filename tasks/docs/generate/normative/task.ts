import {NormativeTypes} from '#/normative'
import Controller from '#controller'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import path from 'path'
import {renderProfile} from '../.utils/profile/utils'

async function main() {
    const dir = path.join('docs', 'docs', 'normative')

    const normative = NormativeTypes()

    const coreFile = path.join(dir, normative.core.yaml)
    files.storeYAML<ServiceTemplate>(coreFile, normative.core.template)
    await Controller.template.puml.types({path: coreFile})
    await renderProfile({
        name: normative.core.id,
        id: 'c',
        profile: normative.core.name,
        dir,
        template: normative.core.template,
    })

    const extendedFile = path.join(dir, normative.extended.yaml)
    files.storeYAML<ServiceTemplate>(extendedFile, normative.extended.template)
    await Controller.template.puml.types({path: extendedFile})
    await renderProfile({
        name: normative.extended.id,
        id: 'e',
        profile: normative.extended.name,
        dir,
        template: normative.extended.template,
    })
}

main()
