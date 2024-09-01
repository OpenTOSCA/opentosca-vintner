import * as files from '#files'
import {TechnologyAssignmentRulesMap} from '#spec/technology-template'
import Registry from '#technologies/plugins/rules/registry'
import * as utils from '#utils'
import path from 'path'
import descriptions from './technologies'

async function main() {
    const dir = path.join('docs', 'docs', 'variability4tosca', 'rules')
    const rules = Registry.rules
    files.storeYAML<TechnologyAssignmentRulesMap>(path.join(dir, 'technology-rules.yaml'), rules)

    const link = (type: string) => {
        if (type === '*') return type
        return `[${type}](../../normative/index.md#${type.replaceAll('.', '')}){target=_blank}`
    }

    await files.renderFile(
        path.join(__dirname, 'template.ejs'),
        {data: rules, utils, link, descriptions},
        path.join(dir, 'index.md')
    )
}

main()
