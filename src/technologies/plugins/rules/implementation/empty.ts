import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {MetadataGenerated} from '#technologies/plugins/rules/implementation/utils'

const generator: ImplementationGenerator = {
    id: 'container.application::ansible::docker.engine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {},
        }
    },
}

export default generator
