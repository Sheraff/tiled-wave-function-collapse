import naiveRules from './rules.js'
import { getImageBitmap } from '../utils.js'

const dirname = import.meta.url.split('/').slice(0, -1).join('/')
const tileSet = await getImageBitmap(`${dirname}/image.jpg`)

const params = {
	tile: {
		width: 256, // px
		height: 256, // px
	},
	grid: {
		width: 16, // tiles
	},
}

const rotate0 = naiveRules.map((is, index) => ({
	index,
	is,
	rotate: 0,
}))
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
	return a.filter(
		option => b.includes(option)
	)
}

function findSuitableTiles(accepts) {
	return rules.filter(option => 
		accepts.every(
			(directionalOption, i) => directionalOption.includes(option.is[i])
		)
	)
}

const initial = {
	border: [0, 1],
	inside: [0, 1, 2, 3],
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