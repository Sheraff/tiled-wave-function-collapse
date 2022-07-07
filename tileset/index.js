import naiveRules from './rules.js'
import { getImageBitmap } from '../utils.js'

const dirname = import.meta.url.split('/').slice(0, -1).join('/')
const tileSet = await getImageBitmap(`${dirname}/image.jpg`)

const params = {
	tile: {
		width: 256,
		height: 256,
	},
	grid: {
		width: 16,
		height: 10,
	},
}

const rules = naiveRules.map((is, index) => ({
	index,
	is,
	rotate: 0,
}))
const rotate90 = rules.map(rotate)
const rotate180 = rotate90.map(rotate)
const rotate270 = rotate180.map(rotate)

function rotate({is: [first, ...rest], index, rotate}) {
	return {
		index,
		is: [...rest, first],
		rotate: rotate + 1,
	}
}

export default {
	params,
	rules: [...rules, ...rotate90, ...rotate180, ...rotate270],
	tileSet,
}