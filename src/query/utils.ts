import {Instance, Instances} from '#repository/instances'
import {Template} from '#repository/templates'
import {Winery} from '#orchestrators/winery'
import * as files from '#files'
import path from 'path'
import {ServiceTemplate} from '#spec/service-template'
import {isString} from '#validator'
import {firstKey, firstValue} from '#utils'

function resolveAllGets(template: ServiceTemplate) {
    let resolvedTemplate = template
    let numberOfGets = 0
    // Recursively go through template to find any get methods and resolve them
    const recursiveRun = (object: any, path: string) => {
        if (typeof object == 'object') {
            if (object === null) return null
            if (firstKey(object) == 'get_property' || firstKey(object) == 'get_attribute') {
                if (path.includes('node_templates')) {
                    numberOfGets++
                    return Object.keys(object)[0] == 'get_property'
                        ? getPropertyOrAttribute('properties', template, firstValue(object), path)
                        : getPropertyOrAttribute('attributes', template, firstValue(object), path)
                } else {
                    return object
                }
            } else if (firstKey(object).includes('get_input')) {
                return resolvePath(template.topology_template?.inputs, firstValue(object)) || object
            }
            Object.keys(object).forEach(key => {
                object[key] = recursiveRun(object[key], path + '.' + key)
            })
        }
        return object
    }
    do {
        const previousNumberOfQueries = numberOfGets
        numberOfGets = 0
        resolvedTemplate = recursiveRun(resolvedTemplate, '')
        if (numberOfGets > 0 && previousNumberOfQueries == numberOfGets)
            throw new Error('Circular dependencies detected. Unable to resolve queries in your template.')
    } while (numberOfGets > 0)
    return resolvedTemplate
}

function getPropertyOrAttribute(
    type: 'properties' | 'attributes',
    template: ServiceTemplate,
    toscaPath: string[],
    context: string
): Object {
    let result =
        toscaPath[0] == 'SELF'
            ? resolvePath(
                  template.topology_template?.node_templates,
                  context.split('.')[context.split('.').indexOf('node_templates') + 1]
              )
            : resolvePath(template.topology_template?.node_templates, toscaPath[0])
    const optionalRel = getRelationship(template, result, toscaPath[1])
    if (optionalRel) result = getRelationship(template, result, toscaPath[1])
    // Turn last x elements of array into path (in case of nested properties)
    const propertyAccess = optionalRel ? toscaPath.slice(2).join('.') : toscaPath.slice(1).join('.')
    return resolvePath(result, `${type}.${propertyAccess}`)
}

function getRelationship(template: ServiceTemplate, data: Object, relName: string): Object | null {
    const reqs: [] = resolvePath(data, 'requirements') || []
    const caps: [] = resolvePath(data, 'capabilities') || []
    for (const req of reqs) {
        if (firstKey(req) == relName) {
            if (isString(firstValue(req))) {
                return template.topology_template?.node_templates?.[firstValue(req) as string] || {}
            } else {
                return template.topology_template?.node_templates?.[req[relName]['node']] || {}
            }
        }
    }
    for (const cap of caps) {
        if (firstKey(cap) == relName) {
            return cap
        }
    }
    return null
}

function resolvePath(obj: any, path: string): any {
    return path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : null
    }, obj)
}

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
    if (type == 'Instance') {
        for (const t of serviceTemplates) {
            t.template = resolveAllGets(t.template)
        }
    }
    return serviceTemplates
}
