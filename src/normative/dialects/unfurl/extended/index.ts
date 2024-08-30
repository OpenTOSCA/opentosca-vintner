import {ServiceTemplate} from '#spec/service-template'
import {RecursivePartial} from '#utils/types'
import {MetadataUnfurl} from '../utils'
import artifacts from './artifacts'
import nodes from './nodes'

const template: RecursivePartial<ServiceTemplate> = {
    metadata: {
        ...MetadataUnfurl(),
    },
    artifact_types: artifacts,
    node_types: nodes,
}

export default template
