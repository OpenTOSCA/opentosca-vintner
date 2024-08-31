import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'
import * as path from 'path'

export async function renderProfile(options: {
    name: string
    id: string
    profile: string
    dir: string
    template: ServiceTemplate
}) {
    await files.renderFile(
        path.join(__dirname, 'profile.template.ejs'),
        {
            template: options.template,
            utils: {
                toYAML: files.toYAML,
                toTitle: (value: string) =>
                    value
                        .split('_')
                        .map(it => utils.toFirstUpperCase(it))
                        .join(' '),
                toText: (value: string) => value.split('_').join(' '),
                toFigure: (value: string) => options.name + '.' + value.replace('_', '-') + '.svg',
            },
            profile: {
                id: options.id,
                variant: options.profile,
            },
        },
        path.join(options.dir, options.name + '.md')
    )
}
