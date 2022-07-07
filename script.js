import DEFINITION from './tileset/index.js'

const GRID_SIZE = [10, 10]
const NEIGHBORS = [
	[0, -1],
	[1, 0],
	[0, 1],
	[-1, 0],
]

const canvas = document.querySelector('canvas')
if(!canvas)
	throw new Error('No canvas found')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')
if(!ctx)
	throw new Error('No context found')

// const coords = getSourceCoordFromIndex(18)
// ctx.drawImage(DEFINITION.tileSet, ...coords, 0, 0, 256, 256)
start(ctx)
// const array = createNewGrid(GRID_SIZE)
// array[array.length - 1].tile = DEFINITION.rules.at(-1)
// draw(ctx, array)


async function start(ctx) {
	const array = createNewGrid(GRID_SIZE)
	const backtrack = { cursor: 0, stack: [] }
	loop(ctx, array, backtrack)
}

async function loop(ctx, array, backtrack) {
	const cells = getMinEntropyCells(array)
	if (cells.length === 0) {
		console.log('done')
		return
	}
	const randomCell = cells[Math.floor(Math.random() * cells.length)]
	try {
		assignSuitableOption(array, randomCell, backtrack)
		collapseNeighbors(array, randomCell)
		backtrack.cursor = Math.max(0, backtrack.cursor - 0.1)
		draw(ctx, array)
		await frame()
		loop(ctx, array, backtrack)
	} catch (error) {
		if(backtrack.stack.length > 0) {
			const reset = resetToCursor(backtrack)
			console.log('backtracking', Math.round(backtrack.cursor), error.message)
			loop(ctx, reset, backtrack)
		} else {
			console.log('restarting', error.message)
			start(ctx)
		}
	}
}

function resetToCursor(backtrack) {
	backtrack.cursor += 1
	const revertCount = Math.min(Math.floor(backtrack.cursor), backtrack.stack.length)
	const [reset] = backtrack.stack.splice(backtrack.stack.length - revertCount)
	return JSON.parse(reset)
}

function createNewGrid([width, height]) {
	return new Array(width * height).fill(0).map((_, index, array) => {
		const x = index % GRID_SIZE[0]
		const y = Math.floor(index / GRID_SIZE[0])
		const top    = y === 0          ? [0] : [0,1,2,3]
		const right  = x === width - 1  ? [0] : [0,1,2,3]
		const bottom = y === height - 1 ? [0] : [0,1,2,3]
		const left   = x === 0          ? [0] : [0,1,2,3]
		const entropy = top.length + right.length + bottom.length + left.length
		return ({
			index,
			x,
			y,
			entropy,
			accepts: [
				top,
				right,
				bottom,
				left,
			],
			tile: null,
		})
	})
}

function assignSuitableOption(array, cell, backtrack) {
	const options = DEFINITION.rules.filter(option => 
		cell.accepts.every(
			(directionalOption, i) => directionalOption.includes(option.is[i])
		)
	)

	if (options.length === 0)
		throw new Error('No suitable options')

	backtrack.stack.push(JSON.stringify(array))
	
	const randomOption = options[Math.floor(Math.random() * options.length)]
	cell.tile = randomOption
}

function collapseNeighbors(array, cell, stack = []) {
	for (let i = 0; i < NEIGHBORS.length; i++) {
		const vector = NEIGHBORS[i]
		const x = cell.x + vector[0]
		const y = cell.y + vector[1]
		if (x < 0 || x >= GRID_SIZE[0] || y < 0 || y >= GRID_SIZE[1])
			continue
		const neighbor = getCellFromXY(array, x, y)
		if (neighbor.tile)
			continue
		const possibilities = cell.tile
			? [cell.tile.is[i]]
			: cell.accepts[i]
		const mirrorIndex = (i + 2) % 4
		const compatibleOptions = neighbor.accepts[mirrorIndex].filter(
			option => possibilities.includes(option)
		)
		if (compatibleOptions.length === 0)
			throw new Error('Invalid neighbor')
		const entropyDifference = neighbor.accepts[mirrorIndex].length - compatibleOptions.length
		if (entropyDifference !== 0)
			stack.push(neighbor)
		neighbor.accepts[mirrorIndex] = compatibleOptions
		neighbor.entropy -= entropyDifference
		// if (neighbor.entropy === 4)
		// 	assignSuitableOption(array, neighbor)
	}
	if (stack.length > 0) {
		const nextCell = stack.shift()
		collapseNeighbors(array, nextCell, stack)
	}
}

function getMinEntropyCells(array) {
	let min = Infinity
	let cells = []
	for(let i = 0; i < array.length; i++) {
		const cell = array[i]
		if (cell.tile)
			continue
		if (cell.entropy < min) {
			min = cell.entropy
			cells = [cell]
		} else if (cell.entropy === min) {
			cells.push(cell)
		}
	}
	return cells
}

function draw(ctx, array) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	for(let y = 0; y < GRID_SIZE[1]; y++) {
		for(let x = 0; x < GRID_SIZE[0]; x++) {
			const cell = getCellFromXY(array, x, y)
			if(!cell.tile)
				continue
			const srcCoord = getSourceCoordFromIndex(cell.tile.index)
			const destCoord = getDestinationCoordFromXY(ctx, x, y)
			ctx.save()
			ctx.translate(
				destCoord[0] + destCoord[2] / 2,
				destCoord[1] + destCoord[3] / 2
			)
			ctx.rotate(-cell.tile.rotate * Math.PI / 2)
			ctx.drawImage(
				DEFINITION.tileSet,
				...srcCoord,
				-destCoord[2] / 2,
				-destCoord[3] / 2,
				destCoord[2],
				destCoord[3])
			ctx.restore()
		}
	}
}

function getDestinationCoordFromXY(ctx, xIndex, yIndex) {
	const cellSide = Math.min(
		Math.floor(ctx.canvas.width / GRID_SIZE[0]),
		Math.floor(ctx.canvas.height / GRID_SIZE[1]),
	)
	const x = xIndex * cellSide
	const y = yIndex * cellSide
	return [x, y, cellSide, cellSide]
}

function getSourceCoordFromIndex(i) {
	const { width, height } = DEFINITION.params.tile
	const { width: gridWidth } = DEFINITION.params.grid
	const x = (i % gridWidth) * width
	const y = Math.floor(i / gridWidth) * height
	return [x, y, width, height]
}

function getCellFromXY(array, x, y) {
	return array[y * GRID_SIZE[0] + x]
}

function frame() {
	return new Promise(resolve => requestAnimationFrame(resolve))
}
