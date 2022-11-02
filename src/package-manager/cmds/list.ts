import {readDependencies} from '../utils'

export default async function () {
    console.log('Listing dependencies')

    readDependencies().forEach(dependency =>
        console.log({
            id: dependency.id,
            name: dependency.name,
            repo: dependency.repo,
            checkout: dependency.checkout,
        })
    )
}
