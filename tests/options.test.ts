import Graph from '#graph/graph'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {expect} from 'chai'

describe('options', () => {
    it('mode: manual', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'manual'}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('mode: consistent-strict', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'consistent-strict'}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.true
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.true
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.true
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.true
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.true
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.true
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.true
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('mode: consistent-loose', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'consistent-loose'}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.true
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.true
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.true
        expect(graph.options.pruning.relationConsistencyPruning).to.be.true
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.true
        expect(graph.options.pruning.policyConsistencyPruning).to.be.true
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.true
        expect(graph.options.pruning.groupConsistencyPruning).to.be.true
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.true
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.true
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.true
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.true
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.true
        expect(graph.options.pruning.typeConsistencyPruning).to.be.true
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('mode: default', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'default'}}},
        })

        expect(graph.options.default.defaultCondition).to.be.true

        expect(graph.options.default.nodeDefaultCondition).to.be.true
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.true

        expect(graph.options.default.relationDefaultCondition).to.be.true
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.true

        expect(graph.options.default.policyDefaultCondition).to.be.true
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.groupDefaultCondition).to.be.true
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.true

        expect(graph.options.default.artifactDefaultCondition).to.be.true
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.true

        expect(graph.options.default.propertyDefaultCondition).to.be.true
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.typeDefaultCondition).to.be.true
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.true

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('mode: semantic-loose', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'loose'}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.true

        expect(graph.options.pruning.nodePruning).to.be.true
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.true
        expect(graph.options.pruning.nodeSemanticPruning).to.be.true

        expect(graph.options.pruning.relationPruning).to.be.true
        expect(graph.options.pruning.relationConsistencyPruning).to.be.true
        expect(graph.options.pruning.relationSemanticPruning).to.be.true

        expect(graph.options.pruning.policyPruning).to.be.true
        expect(graph.options.pruning.policyConsistencyPruning).to.be.true
        expect(graph.options.pruning.policySemanticPruning).to.be.true

        expect(graph.options.pruning.groupPruning).to.be.true
        expect(graph.options.pruning.groupConsistencyPruning).to.be.true
        expect(graph.options.pruning.groupSemanticPruning).to.be.true

        expect(graph.options.pruning.artifactPruning).to.be.true
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.true
        expect(graph.options.pruning.artifactSemanticPruning).to.be.true

        expect(graph.options.pruning.propertyPruning).to.be.true
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.true
        expect(graph.options.pruning.propertySemanticPruning).to.be.true

        expect(graph.options.pruning.typePruning).to.be.true
        expect(graph.options.pruning.typeConsistencyPruning).to.be.true
        expect(graph.options.pruning.typeSemanticPruning).to.be.true
    })

    it('default_condition: false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {default_condition: false}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('default_condition: true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {default_condition: true}}},
        })

        expect(graph.options.default.defaultCondition).to.be.true

        expect(graph.options.default.nodeDefaultCondition).to.be.true
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.true

        expect(graph.options.default.relationDefaultCondition).to.be.true
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.true

        expect(graph.options.default.policyDefaultCondition).to.be.true
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.groupDefaultCondition).to.be.true
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.true

        expect(graph.options.default.artifactDefaultCondition).to.be.true
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.true

        expect(graph.options.default.propertyDefaultCondition).to.be.true
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.typeDefaultCondition).to.be.true
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.true

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('pruning: true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {pruning: true}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.true

        expect(graph.options.pruning.nodePruning).to.be.true
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.true
        expect(graph.options.pruning.nodeSemanticPruning).to.be.true

        expect(graph.options.pruning.relationPruning).to.be.true
        expect(graph.options.pruning.relationConsistencyPruning).to.be.true
        expect(graph.options.pruning.relationSemanticPruning).to.be.true

        expect(graph.options.pruning.policyPruning).to.be.true
        expect(graph.options.pruning.policyConsistencyPruning).to.be.true
        expect(graph.options.pruning.policySemanticPruning).to.be.true

        expect(graph.options.pruning.groupPruning).to.be.true
        expect(graph.options.pruning.groupConsistencyPruning).to.be.true
        expect(graph.options.pruning.groupSemanticPruning).to.be.true

        expect(graph.options.pruning.artifactPruning).to.be.true
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.true
        expect(graph.options.pruning.artifactSemanticPruning).to.be.true

        expect(graph.options.pruning.propertyPruning).to.be.true
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.true
        expect(graph.options.pruning.propertySemanticPruning).to.be.true

        expect(graph.options.pruning.typePruning).to.be.true
        expect(graph.options.pruning.typeConsistencyPruning).to.be.true
        expect(graph.options.pruning.typeSemanticPruning).to.be.true
    })

    it('pruning: false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {pruning: false}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('manual override: default_condition true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'manual', default_condition: true}}},
        })

        expect(graph.options.default.defaultCondition).to.be.true

        expect(graph.options.default.nodeDefaultCondition).to.be.true
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.true

        expect(graph.options.default.relationDefaultCondition).to.be.true
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.true

        expect(graph.options.default.policyDefaultCondition).to.be.true
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.groupDefaultCondition).to.be.true
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.true

        expect(graph.options.default.artifactDefaultCondition).to.be.true
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.true

        expect(graph.options.default.propertyDefaultCondition).to.be.true
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.typeDefaultCondition).to.be.true
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.true

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('manual override: pruning true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'manual', pruning: true}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.true

        expect(graph.options.pruning.nodePruning).to.be.true
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.true
        expect(graph.options.pruning.nodeSemanticPruning).to.be.true

        expect(graph.options.pruning.relationPruning).to.be.true
        expect(graph.options.pruning.relationConsistencyPruning).to.be.true
        expect(graph.options.pruning.relationSemanticPruning).to.be.true

        expect(graph.options.pruning.policyPruning).to.be.true
        expect(graph.options.pruning.policyConsistencyPruning).to.be.true
        expect(graph.options.pruning.policySemanticPruning).to.be.true

        expect(graph.options.pruning.groupPruning).to.be.true
        expect(graph.options.pruning.groupConsistencyPruning).to.be.true
        expect(graph.options.pruning.groupSemanticPruning).to.be.true

        expect(graph.options.pruning.artifactPruning).to.be.true
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.true
        expect(graph.options.pruning.artifactSemanticPruning).to.be.true

        expect(graph.options.pruning.propertyPruning).to.be.true
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.true
        expect(graph.options.pruning.propertySemanticPruning).to.be.true

        expect(graph.options.pruning.typePruning).to.be.true
        expect(graph.options.pruning.typeConsistencyPruning).to.be.true
        expect(graph.options.pruning.typeSemanticPruning).to.be.true
    })

    it('loose override: pruning false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {variability: {options: {mode: 'loose', pruning: false}}},
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false
        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('default_condition override: node_default_condition false', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {
                variability: {options: {default_condition: true, node_default_condition: false}},
            },
        })

        expect(graph.options.default.defaultCondition).to.be.true

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.false

        expect(graph.options.default.relationDefaultCondition).to.be.true
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.true

        expect(graph.options.default.policyDefaultCondition).to.be.true
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.groupDefaultCondition).to.be.true
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.true

        expect(graph.options.default.artifactDefaultCondition).to.be.true
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.true

        expect(graph.options.default.propertyDefaultCondition).to.be.true
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.typeDefaultCondition).to.be.true
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.true

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('default_condition override: node_default_condition true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {
                variability: {options: {default_condition: false, node_default_condition: true}},
            },
        })

        expect(graph.options.default.defaultCondition).to.be.false

        expect(graph.options.default.nodeDefaultCondition).to.be.true
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.true

        expect(graph.options.default.relationDefaultCondition).to.be.false
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.false

        expect(graph.options.default.policyDefaultCondition).to.be.false
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.groupDefaultCondition).to.be.false
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.false

        expect(graph.options.default.artifactDefaultCondition).to.be.false
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.false

        expect(graph.options.default.propertyDefaultCondition).to.be.false
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.false

        expect(graph.options.default.typeDefaultCondition).to.be.false
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.false

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })

    it('default_condition, node_default_condition override: node_default_semantic_condition true', () => {
        const graph = new Graph({
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
            topology_template: {
                variability: {
                    options: {
                        default_condition: true,
                        node_default_condition: false,
                        node_default_semantic_condition: true,
                    },
                },
            },
        })

        expect(graph.options.default.defaultCondition).to.be.true

        expect(graph.options.default.nodeDefaultCondition).to.be.false
        expect(graph.options.default.nodeDefaultConditionMode).to.equal('incoming-artifact')
        expect(graph.options.default.nodeDefaultConsistencyCondition).to.be.false
        expect(graph.options.default.nodeDefaultSemanticCondition).to.be.true

        expect(graph.options.default.relationDefaultCondition).to.be.true
        expect(graph.options.default.relationDefaultConditionMode).to.equal('source-target')
        expect(graph.options.default.relationDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.relationDefaultSemanticCondition).to.be.true

        expect(graph.options.default.policyDefaultCondition).to.be.true
        expect(graph.options.default.policyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.policyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.groupDefaultCondition).to.be.true
        expect(graph.options.default.groupDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.groupDefaultSemanticCondition).to.be.true

        expect(graph.options.default.artifactDefaultCondition).to.be.true
        expect(graph.options.default.artifactDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.artifactDefaultSemanticCondition).to.be.true

        expect(graph.options.default.propertyDefaultCondition).to.be.true
        expect(graph.options.default.propertyDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.propertyDefaultSemanticCondition).to.be.true

        expect(graph.options.default.typeDefaultCondition).to.be.true
        expect(graph.options.default.typeDefaultConsistencyCondition).to.be.true
        expect(graph.options.default.typeDefaultSemanticCondition).to.be.true

        expect(graph.options.pruning.pruning).to.be.false

        expect(graph.options.pruning.nodePruning).to.be.false
        expect(graph.options.pruning.nodeConsistencyPruning).to.be.false
        expect(graph.options.pruning.nodeSemanticPruning).to.be.false

        expect(graph.options.pruning.relationPruning).to.be.false
        expect(graph.options.pruning.relationConsistencyPruning).to.be.false
        expect(graph.options.pruning.relationSemanticPruning).to.be.false

        expect(graph.options.pruning.policyPruning).to.be.false
        expect(graph.options.pruning.policyConsistencyPruning).to.be.false
        expect(graph.options.pruning.policySemanticPruning).to.be.false

        expect(graph.options.pruning.groupPruning).to.be.false
        expect(graph.options.pruning.groupConsistencyPruning).to.be.false
        expect(graph.options.pruning.groupSemanticPruning).to.be.false

        expect(graph.options.pruning.artifactPruning).to.be.false
        expect(graph.options.pruning.artifactConsistencyPruning).to.be.false
        expect(graph.options.pruning.artifactSemanticPruning).to.be.false

        expect(graph.options.pruning.propertyPruning).to.be.false
        expect(graph.options.pruning.propertyConsistencyPruning).to.be.false
        expect(graph.options.pruning.propertySemanticPruning).to.be.false

        expect(graph.options.pruning.typePruning).to.be.false
        expect(graph.options.pruning.typeConsistencyPruning).to.be.false
        expect(graph.options.pruning.typeSemanticPruning).to.be.false
    })
})
