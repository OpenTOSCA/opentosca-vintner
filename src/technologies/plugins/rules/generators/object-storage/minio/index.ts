import asterisk from './asterisk'
import kubernetesCluster from './kubernetes-cluster'

// TODO: migrate to docker.engine and add compose tasks with quality of 0?

export default [asterisk, kubernetesCluster]
