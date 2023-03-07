export class UnexpectedError extends Error {
    constructor(msg = 'Unexpected event') {
        super(msg)
    }
}

export class NotImplementedError extends Error {
    constructor(msg = 'Not implemented') {
        super(msg)
    }
}
