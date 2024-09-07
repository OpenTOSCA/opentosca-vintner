import Controller from '#controller'
import * as files from '#files'
import {NormativeTypes} from '#normative'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'
import path from 'path'

async function main() {
    const dir = path.join('docs', 'docs', 'normative')
    files.removeDirectory(dir)
    files.createDirectory(dir)

    const normative = NormativeTypes()

    const profileFile = path.join(dir, normative.profile.yaml)
    files.storeYAML<ServiceTemplate>(profileFile, normative.profile.template)

    const coreFile = path.join(dir, normative.core.yaml)
    files.storeYAML<ServiceTemplate>(coreFile, normative.core.template)
    await Controller.template.puml.types({path: coreFile, format: 'svg'})

    const extendedFile = path.join(dir, normative.extended.yaml)
    files.storeYAML<ServiceTemplate>(extendedFile, normative.extended.template)
    await Controller.template.puml.types({path: extendedFile, format: 'svg'})

    await files.renderFile(
        path.join(__dirname, 'template.ejs'),
        {
            core: {
                id: normative.core.id,
                figure: 'C',
                name: normative.core.name,
                template: normative.core.template,
            },
            extended: {
                id: normative.extended.id,
                figure: 'E',
                profile: normative.extended.name,
                template: normative.extended.template,
            },
            utils: {
                toYAML: files.toYAML,
                toFirstUpperCase: utils.toFirstUpperCase,
            },
        },
        path.join(dir, 'index.md')
    )
}

main()
