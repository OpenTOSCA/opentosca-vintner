import * as check from '#check'
import Artifact from '#graph/artifact'
import {bratify} from '#graph/utils'
import {ExtendedArtifactDefinition} from '#spec/artifact-definitions'
import {GroupTemplate} from '#spec/group-template'
import {NodeTemplate} from '#spec/node-template'
import {PolicyTemplate} from '#spec/policy-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {TypeAssignment} from '#spec/type-assignment'
import {LogicExpression} from '#spec/variability'
import {isNormative} from '#technologies/utils'
import * as utils from '#utils'
import Element from './element'
import Group from './group'
import Node from './node'
import Policy from './policy'
import Relation from './relation'

export type TypeContainer = Node | Relation | Policy | Group | Artifact
export type TypeContainerTemplate =
    | NodeTemplate
    | RelationshipTemplate
    | PolicyTemplate
    | GroupTemplate
    | ExtendedArtifactDefinition

export default class Type extends Element {
    readonly type = 'type'
    readonly name: string
    readonly raw: TypeAssignment

    readonly index: number
    readonly container: TypeContainer

    constructor(data: {name: string; container: TypeContainer; index: number; raw: TypeAssignment}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container

        this.conditions = check.isDefined(data.raw.default_alternative) ? [false] : utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false
    }

    get toscaId() {
        if (check.isString(this.container.toscaId)) return [this.container.toscaId, this.index]
        if (check.isNumber(this.container.toscaId)) return [this.container.toscaId, this.index]
        return [...this.container.toscaId, this.index]
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.typeDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.typePruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.typeDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.typeDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.typeConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.typeSemanticPruning
    }

    getElementGenericCondition() {
        return [
            {
                conditions: this.container.presenceCondition,
                consistency: true,
                semantic: false,
            },
        ]
    }

    constructPresenceCondition() {
        return this.container.getTypeCondition(this)
    }

    // Check if no other type is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.container.types.filter(it => it !== this))
    }

    private _isA: {[name: string]: boolean | undefined} = {}

    isA(name: string) {
        if (check.isUndefined(this._isA[name])) {
            if (this.container.isArtifact()) {
                this._isA[name] = this.graph.inheritance.isArtifactType(this.name, name)
            }

            if (this.container.isGroup()) {
                this._isA[name] = this.graph.inheritance.isGroupType(this.name, name)
            }

            if (this.container.isNode()) {
                this._isA[name] = this.graph.inheritance.isNodeType(this.name, name)
            }

            if (this.container.isPolicy()) {
                this._isA[name] = this.graph.inheritance.isPolicyType(this.name, name)
            }

            if (this.container.isRelation()) {
                this._isA[name] = this.graph.inheritance.isRelationshipType(this.name, name)
            }

            if (check.isUndefined(this._isA[name])) {
                throw new Error(`${this.Display} does not support checking type inheritance`)
            }
        }

        return this._isA[name]!
    }

    getDefinition() {
        if (this.container.isArtifact()) {
            return this.graph.inheritance.getArtifactType(this.name)
        }

        if (this.container.isGroup()) {
            return this.graph.inheritance.getGroupType(this.name)
        }

        if (this.container.isNode()) {
            return this.graph.inheritance.getNodeType(this.name)
        }

        if (this.container.isPolicy()) {
            return this.graph.inheritance.getPolicyType(this.name)
        }

        if (this.container.isRelation()) {
            return this.graph.inheritance.getRelationshipType(this.name)
        }

        throw new Error(`${this.Display} does not support checking type inheritance`)
    }

    isType(): this is Type {
        return true
    }

    private _isNormative?: boolean

    isNormative() {
        if (check.isUndefined(this._isNormative)) this._isNormative = isNormative(this)
        return this._isNormative!
    }

    private _hasOperation: {[operation: string]: boolean | undefined} = {}

    hasOperation(operation: string) {
        if (check.isUndefined(this._hasOperation[operation])) {
            if (this.container.isNode()) {
                this._hasOperation[operation] = this.graph.inheritance.hasManagementOperation(this.name, operation)
            }

            if (check.isUndefined(this._hasOperation[operation])) {
                throw new Error(`${this.Display} does not support checking for operation`)
            }
        }

        return this._hasOperation[operation]!
    }

    private _hasArtifact: {[artifact: string]: boolean | undefined} = {}

    hasArtifact(artifact: string) {
        if (check.isUndefined(this._hasArtifact[artifact])) {
            if (this.container.isNode()) {
                this._hasArtifact[artifact] = this.graph.inheritance.hasArtifactDefinition(this.name, artifact)
            }

            if (check.isUndefined(this._hasArtifact[artifact])) {
                throw new Error(`${this.Display} does not support checking for operation`)
            }
        }
        return this._hasArtifact[artifact]!
    }
}
