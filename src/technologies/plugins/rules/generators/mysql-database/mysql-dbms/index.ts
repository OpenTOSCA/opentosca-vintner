import dockerEngine from './docker-engine'
import gcpCloudSQL from './gcp-cloudsql'
import kubernetesCluster from './kubernetes-cluster'
import virtualMachine from './virtual-machine'

export default [dockerEngine, gcpCloudSQL, kubernetesCluster, virtualMachine]
