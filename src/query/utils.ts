import {Instance, Instances} from '#repository/instances'
import {Template, Templates} from '#repository/templates'
import {Winery} from '#orchestrators/winery'
import * as files from '#files'
import path from 'path'
import {ServiceTemplate} from '#spec/service-template'

export function getTemplates(
    source: string,
    type: string,
    templatePath: string
): {name: string; template: ServiceTemplate}[] {
    let serviceTemplates: {name: string; template: ServiceTemplate}[] = []
    switch (source) {
        case 'vintner':
            if (type == 'Instance') {
                if (templatePath == '*') {
                    for (const t of Instances.all()) {
                        serviceTemplates.push({name: t.getName(), template: t.getTemplateWithAttributes()})
                    }
                } else {
                    serviceTemplates.push({
                        name: templatePath,
                        template: new Instance(templatePath).getTemplateWithAttributes(),
                    })
                }
            } else if (type == 'Template' && templatePath == '*') {
                for (const t of Templates.all()) {
                    serviceTemplates.push({name: t.getName(), template: t.getVariableServiceTemplate()})
                }
            } else {
                serviceTemplates.push({
                    name: templatePath,
                    template: new Template(templatePath).getVariableServiceTemplate(),
                })
            }
            break
        case 'winery': {
            const winery = new Winery()
            if (type == 'Instance') {
                console.error('Cannot query instance data on Winery repository. Use "FROM template" instead.')
            } else if (templatePath == '*') {
                serviceTemplates = winery.getAllTemplates()
            } else {
                serviceTemplates.push(winery.getTemplate(templatePath))
            }
            break
        }
        case 'file': {
            serviceTemplates.push({
                name: templatePath,
                template: files.loadYAML(path.resolve(templatePath)),
            })
        }
    }
    return serviceTemplates
}
