import dockerEngine from './docker-engine'
import gcpCloudSQL from './gcp-cloudsql'
import kubernetesCluster from './kubernetes-cluster'
import remoteMachine from './remote-machine'

export default [dockerEngine, gcpCloudSQL, kubernetesCluster, remoteMachine]
