export default class Queue<T> {
    private items: T[] = []

    add(item: T) {
        this.items.push(item)
    }

    pop(): T | undefined {
        return this.items.shift()
    }

    peek(): T {
        return this.items[0]
    }

    isEmpty(): boolean {
        return this.items.length == 0
    }
}
