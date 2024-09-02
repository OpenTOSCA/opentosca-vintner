import Controller from '#controller'
import * as files from '#files'
import Loader from '#graph/loader'
import * as utils from '#utils'
import * as path from 'path'

async function main() {
    const dir = path.join('docs', 'docs', 'sofdcar')

    const coreName = 'tosca-sofdcar-profile-core'
    const coreFile = path.join(dir, coreName + '.yaml')
    const coreTemplate = new Loader(coreFile).raw()
    await Controller.template.puml.types({path: coreFile, format: 'svg'})

    const extendedName = 'tosca-sofdcar-profile-extended'
    const extendedFile = path.join(dir, extendedName + '.yaml')
    const extendedTemplate = new Loader(extendedFile).raw()
    await Controller.template.puml.types({path: extendedFile, format: 'svg'})

    await files.renderFile(
        path.join(__dirname, 'template.ejs'),
        {
            core: {
                id: coreName,
                figure: 'C',
                name: 'TOSCA SofDCar Core',
                template: coreTemplate,
            },
            extended: {
                id: extendedName,
                figure: 'E',
                profile: 'TOSCA SofDCar Extended',
                template: extendedTemplate,
            },
            utils: {
                toYAML: files.toYAML,
                toFirstUpperCase: utils.toFirstUpperCase,
            },
        },
        path.join(dir, 'profile.md')
    )

    await Controller.template.puml.topology({
        path: path.join(dir, 'guides', 'location', 'service-template.yaml'),
        format: 'svg',
    })

    await Controller.template.puml.topology({
        path: path.join(dir, 'guides', 'zone', 'service-template.yaml'),
        format: 'svg',
    })
}

main()
