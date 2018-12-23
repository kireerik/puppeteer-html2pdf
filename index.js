const launch = require('tiny-puppeteer')
, path = require('path')

var browser, page, ready = false, closeable = false, tasks = []

const handleNextTask = async () => {
	if (tasks.length) {
		const {htmlPath, pdfPath, format} = tasks[0]

		tasks.splice(0, 1)

		await generatePDF(htmlPath, pdfPath, format)
	}
}

, closePdfGenerator = () => {
	if (ready && tasks.length == 0)
		browser.close()
	else
		closeable = true
}
, generatePDF = async (htmlPath, pdfPath, format) => {
	if (ready) {
		ready = false

		await page.goto('file:///' + path.resolve(htmlPath).split(path.sep).join('/'))

		if (typeof pdfPath == 'function')
			pdfPath = await pdfPath(page)

		await page.pdf({path: pdfPath, format: format || 'Letter'})

		ready = true
		handleNextTask()
	} else
		tasks.push({htmlPath, pdfPath, format})

	if (closeable)
		closePdfGenerator()
}

(async () => {
	browser = await launch()
	page = await browser.newPage()
	ready = true
	handleNextTask()
})()

module.exports = {generatePDF, closePdfGenerator}