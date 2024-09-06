import dockerEngine from './docker-engine'
import gcpMemoryStore from './gcp-memorystore'
import kubernetesCluster from './kubernetes-cluster'

export default [gcpMemoryStore, dockerEngine, kubernetesCluster]
