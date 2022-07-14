import naiveRules from './rules.js'
import { getImageBitmap } from '../utils.js'

const dirname = import.meta.url.split('/').slice(0, -1).join('/')
const tileSet = await getImageBitmap(`${dirname}/image.png`)

const params = {
	tile: {
		width: 240, // px
		height: 240, // px
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

const uniqueSides = naiveRules
	.flat()
	.filter(Boolean)
	.reduce(
		(rules, rule) => {
			if(!rules.some(
				other => other.reduce(
					(bool, value, i) => bool && rule[i] === value,
					true
				)
			)) {
				rules.push(rule)
			}
			return rules
		},
		[]
	)

console.log(uniqueSides)

const initial = {
	border: [
		[0, 0, 0],
	],
	inside: uniqueSides,
}

const backtrack = {
	increase: 1,
	decrease: 0.1,
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