import naiveRules from './rules.js'
import { getImageBitmap } from '../utils.js'

const dirname = import.meta.url.split('/').slice(0, -1).join('/')
const tileSet = await getImageBitmap(`${dirname}/image10.png`)

const params = {
	tile: {
		width: 140, // px
		height: 140, // px
	},
	grid: {
		width: 4, // tiles
	},
}

const rotate0 = naiveRules.map((is, index) => is 
	? {
		index,
		is,
		rotate: 0,
	} : null
).filter(Boolean)
const rotate90 = rotate0.map(rotate)
const rotate180 = rotate90.map(rotate)
const rotate270 = rotate180.map(rotate)
const rules = [...rotate0, ...rotate90, ...rotate180, ...rotate270]

function rotate({is: [first, ...rest], index, rotate}) {
	return {
		index,
		is: [...rest, first],
		rotate: rotate + 1,
	}
}

function findSockets(a, b) {
	return b.filter(
		bOption => a.some(
			(aOption) => bOption.every(
				(value, i) => value === aOption.at(-(i + 1))
			)
		)
	)
}

function findSuitableTiles(accepts) {
	return rules.filter(ruleOption => 
		ruleOption.is.every((aOption, dir) =>
			accepts[dir].some((bOption) =>
				bOption.every(
					(value, i) => value === aOption.at(i)
				)
			)
		)
	)
}

const initial = {
	border: [
		[0, 0, 0],
	],
	inside: [
		[0, 0, 0],
		[0, 1, 0],
		[0, 2, 0],
		[0, 0, 3],
		[3, 0, 0],
		[3, 3, 3],
		[3, 0, 3],
	],
}

const backtrack = {
	increase: 1,
	decrease: 0.5,
}

export default {
	params,
	rules,
	tileSet,
	findSockets,
	findSuitableTiles,
	initial,
	backtrack,
}