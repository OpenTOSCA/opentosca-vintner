import {Templates} from '#repositories/templates'

export default async function () {
    return Templates.all()
}
