import {SensorBaseOptions} from '#controller/sensors/utils'

export type SensorLocationOptions = SensorBaseOptions

export default async function (options: SensorLocationOptions) {
    // TODO: location sensor
    // TODO: curl https://ipinfo.io
}

export type IPInfo = {
    ip: string
    city: string
    region: string
    country: string
    loc: string
    postal: string
    timezone: string
}
