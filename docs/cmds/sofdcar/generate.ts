import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'
import * as path from 'path'

async function run(name: string) {
    const dir = path.join('docs', 'docs', 'sofdcar')
    const template = files.loadYAML<ServiceTemplate>(path.join(dir, name + '.yaml'))
    await files.renderFile(
        path.join(__dirname, 'profile.template.ejs'),
        {
            template,
            utils: {
                toYAML: files.toYAML,
                toTitle: (value: string) =>
                    value
                        .split('_')
                        .map(it => utils.toFirstUpperCase(it))
                        .join(' '),
                toText: (value: string) => value.split('_').join(' '),
                toFigure: (value: string) => name + '.' + value.replace('_', '-') + '.svg',
            },
        },
        path.join(dir, name + '.md')
    )
}

async function main() {
    await run('tosca-sofdcar-profile-core')
    await run('tosca-sofdcar-profile-extended')
}

main()
