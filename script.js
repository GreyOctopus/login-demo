// feature detection for drag&drop upload
const isAdvancedUpload = function () {
	const div = document.createElement('div')
	return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window
}()

document.addEventListener("DOMContentLoaded", function (event) {
	// applying the effect for every form
	const forms = document.querySelectorAll('.box')
	Array.prototype.forEach.call(forms, function (form) {
		const input = form.querySelector('input[type="file"]')
		const label = form.querySelector('label')
		const errorMsg = form.querySelector('.box__error span')
		const restart = form.querySelectorAll('.box__restart')
		const showFiles = function (files) {
			console.log(files[0].name)
			label.textContent = files[0].name
		}
		const triggerFormSubmit = function () {
			const event = document.createEvent('HTMLEvents')
			event.initEvent('submit', true, false)
			form.dispatchEvent(event)
		}

		// letting the server side to know we are going to make an Ajax request
		const ajaxFlag = document.createElement('input')
		ajaxFlag.setAttribute('type', 'hidden')
		ajaxFlag.setAttribute('name', 'ajax')
		ajaxFlag.setAttribute('value', 1)
		form.appendChild(ajaxFlag)

		// automatically submit the form on file select
		input.addEventListener('change', function (e) {
			showFiles(e.target.files)


		})

		// drag&drop files if the feature is available
		if (isAdvancedUpload) {
			form.classList.add('has-advanced-upload'); // letting the CSS part to know drag&drop is supported by the browser

			['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
				form.addEventListener(event, function (e) {
					// preventing the unwanted behaviours
					e.preventDefault()
					e.stopPropagation()
				})
			});
			['dragover', 'dragenter'].forEach(function (event) {
				form.addEventListener(event, function () {
					form.classList.add('is-dragover')
				})
			});
			['dragleave', 'dragend', 'drop'].forEach(function (event) {
				form.addEventListener(event, function () {
					form.classList.remove('is-dragover')
				})
			})
			form.addEventListener('drop', function (e) {
				input.files = e.dataTransfer.files
				showFiles(input.files)

			})
		}


		// if the form was submitted
		form.addEventListener('submit', (e) => {
			// preventing the duplicate submissions if the current one is in progress
			if (form.classList.contains('is-uploading')) return false

			form.classList.add('is-uploading')
			form.classList.remove('is-error')

			if (isAdvancedUpload) {
				e.preventDefault()

				// gathering the form data
				const ajaxData = new FormData()
				const inputField = document.querySelector("body > div > div > div > div > div.max-w-7xl.mx-auto.sm\\:px-6.lg\\:px-8 > div:nth-child(1) > div > div > input").value.split(",")
				ajaxData.append("input", JSON.stringify(inputField))
				const outputField = document.querySelector("body > div > div > div > div > div.max-w-7xl.mx-auto.sm\\:px-6.lg\\:px-8 > div:nth-child(2) > div > div > input").value.split(",")
				ajaxData.append("output", JSON.stringify(outputField))
				const file = document.querySelector("#file").files[0]
				console.log(file)
				ajaxData.append("file", file)

				// ajax request
				const ajax = new XMLHttpRequest()
				ajax.open(form.getAttribute('method'), form.getAttribute('action'), true)

				ajax.onload = function () {
					form.classList.remove('is-uploading')
					if (ajax.status >= 200 && ajax.status < 400) {
						const data = JSON.parse(ajax.responseText)
						form.classList.add(data.success == true ? 'is-success' : 'is-error')
						if (!data.success) errorMsg.textContent = data.error
					}
					else alert('Error. Please, contact the webmaster!')
				}

				ajax.onerror = function () {
					form.classList.remove('is-uploading')
					alert('Error. Please, try again!')
				}

				ajax.send(ajaxData)
			}
		})
			// Firefox focus bug fix for file input
		input.addEventListener('focus', function () { input.classList.add('has-focus') })
		input.addEventListener('blur', function () { input.classList.remove('has-focus') })
	})
})
