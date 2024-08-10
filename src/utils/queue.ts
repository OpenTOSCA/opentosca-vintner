import * as assert from '#assert'

export default class Queue<T> {
    private items: T[] = []

    add(item: T) {
        this.items.push(item)
    }

    pop(): T | undefined {
        return this.items.shift()
    }

    next(): T {
        const result = this.pop()
        assert.isDefined(result)
        return result
    }

    peek(): T {
        return this.items[0]
    }

    isEmpty(): boolean {
        return this.items.length == 0
    }
}
