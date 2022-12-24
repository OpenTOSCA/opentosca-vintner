import {Instance, Instances} from '#repository/instances'
import {Template} from '#repository/templates'
import {Winery} from '#plugins/winery'
import * as files from '#files'
import path from 'path'
import {ServiceTemplate} from '#spec/service-template'
import {isString} from '#validator'
import {firstKey, firstValue} from '#utils'

/**
 * Tries to resolve get_Attribute and get_Property commands in template to get the actual value
 * @param template The template to resolve the commands in
 */
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
    context: string,
): Object {
    let result =
        toscaPath[0] == 'SELF'
            ? resolvePath(template.topology_template?.node_templates, getParentNode(context))
            : resolvePath(template.topology_template?.node_templates, toscaPath[0])
    const optionalRel = getRelationship(template, result, toscaPath[1])
    if (optionalRel) result = getRelationship(template, result, toscaPath[1])
    // Turn last x elements of array into path (in case of nested properties)
    const propertyAccess = optionalRel ? toscaPath.slice(2).join('.') : toscaPath.slice(1).join('.')
    return resolvePath(result, `${type}.${propertyAccess}`)
}

/**
 * Tries to find a capability or requirement of a node by name, then returns the data of the target of that relationship
 * Used to resolve TOSCA path expressions
 * @param template The template that contains the node
 * @param node The current node
 * @param relName The name of the capability or requirement
 */
function getRelationship(template: ServiceTemplate, node: Object, relName: string): Object | null {
    const reqs: [] = resolvePath(node, 'requirements') || []
    const caps: [] = resolvePath(node, 'capabilities') || []
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

export function getParentNode(context: string): string {
    return context.split('.')[context.split('.').indexOf('node_templates') + 1]
}

function resolvePath(obj: any, path: string): any {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : null
    }, obj)
}

/**
 * Tries to load all service template from a given source and path
 * @param source Root folder to search
 * @param type When searching for instances, enhance templates with instance data
 * @param templatePath The name or path of the template/instance to search
 */
export function getTemplates(
    source: string,
    type: 'Instance' | 'Template',
    templatePath: string,
): {name: string; template: ServiceTemplate}[] {
    const templates = _getTemplates(source, type, templatePath)

    // TODO: why only on instance ...
    if (type === 'Instance') {
        for (const t of templates) {
            // TODO: this logic should be moved in the graph
            t.template = resolveAllGets(t.template)
        }
    }

    return templates
}

function _getTemplates(
    source: string,
    type: 'Instance' | 'Template',
    templatePath: string,
): {name: string; template: ServiceTemplate}[] {
    // TODO: this should use some kind of plugin registry

    switch (type) {
        case 'Template':
            switch (source) {
                case 'file':
                    return [
                        {
                            name: templatePath,
                            template: files.loadYAML(path.resolve(templatePath)),
                        },
                    ]

                case 'winery': {
                    const winery = new Winery()
                    if (templatePath == '*') return winery.getTemplates()
                    return [winery.getTemplate(templatePath)]
                }

                case 'vintner':
                    // TODO: this should use Templates and not Instances and should filter for correct definitions version

                    if (templatePath === '*')
                        return Instances.all().map(it => ({
                            name: it.getName(),
                            template: it.getServiceTemplate(),
                        }))

                    return [
                        {
                            name: templatePath,
                            template: new Instance(templatePath).getServiceTemplate(),
                        },
                    ]

                default:
                    throw new Error(`Unknown templates plugin "${source}"`)
            }

        case 'Instance':
            switch (source) {
                case 'vintner':
                    if (templatePath === '*')
                        return Instances.all().map(it => ({
                            name: it.getName(),
                            template: it.getInstanceTemplate(),
                        }))

                    return [
                        {
                            name: templatePath,
                            template: new Instance(templatePath).getInstanceTemplate(),
                        },
                    ]

                default:
                    throw new Error(`Unknown instances plugin "${source}"`)
            }

        default:
            throw new Error(`Unknown type "${type}"`)
    }
}
