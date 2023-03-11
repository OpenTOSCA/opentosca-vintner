import dayjs from 'dayjs'

import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrBefore)

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
dayjs.extend(isSameOrAfter)

export default dayjs
