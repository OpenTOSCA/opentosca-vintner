import {Instance, Instances} from '#repository/instances'
import {Template} from '#repository/templates'
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
                    for (const i of Instances.all()) {
                        serviceTemplates.push({name: i.getName(), template: i.getTemplateWithAttributes()})
                    }
                } else {
                    serviceTemplates.push({
                        name: templatePath,
                        template: new Instance(templatePath).getTemplateWithAttributes(),
                    })
                }
            } else if (type == 'Template' && templatePath == '*') {
                for (const i of Instances.all()) {
                    serviceTemplates.push({name: i.getName(), template: i.getServiceTemplate()})
                }
            } else {
                serviceTemplates.push({
                    name: templatePath,
                    template: new Instance(templatePath).getServiceTemplate(),
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
