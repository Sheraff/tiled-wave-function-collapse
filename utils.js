export async function getImageBitmap(url) {
	const data = await fetch(url)
	const blob = await data.blob()
	const bitmap = await createImageBitmap(blob)
	return bitmap
}