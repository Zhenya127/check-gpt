const urlMessage = 'https://zhenya127-check-gpt-39f8.twc1.net/generate-reply/';
const urlReview = 'https://zhenya127-check-gpt-39f8.twc1.net/review/'

const node = document.getElementById('result')
const review = document.getElementById('review')
const checkButton = document.getElementById('checkButton')
const generatePDFButton = document.getElementById('generatePDFButton')
const tableColumn = ['Текст', 'Значение']
const selectList = document.getElementById('selectModel');
let result = []
let parsedText = ''

function splitTextIntoSentences(text) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || []
    const sentenceGroups = []

    for (let i = 0; i < sentences.length; i += 4) {
        sentenceGroups.push(sentences.slice(i, i + 4).join(' '))
    }

    return sentenceGroups
}

function readFile(input) {
    if (node.rows.length > 0) {
        node.deleteRow(0)
        node.deleteRow(0)
    }

    review.classList.remove('app__review__visible')
    review.classList.add('app__review__hidden')

    generatePDFButton.disabled = true

    const textarea = document.getElementById('textarea');
    textarea.value = ''

    let file = input.files[0]

    const value = selectList.value

    if (file.type === 'application/pdf') {
        const reader = new FileReader()
        reader.onload = function(event) {
            const loadingTask = window.pdfjsLib.getDocument({data: event.target.result})
            loadingTask.promise.then(function(pdf) {
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then(function(page) {
                        page.getTextContent().then(function(textContent) {
                            textContent.items.forEach(function(item) {
                                fullText += item.str + ' '
                            });
                            if (i === pdf.numPages) { // Ensure we process the text only after the last page is read
                                parsedText = splitTextIntoSentences(fullText)
                            }
                        })
                    })
                }
            }, function(reason) {
                console.error(reason)
            });
        };
        reader.readAsArrayBuffer(file)
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const reader = new FileReader()
        reader.onload = function(event) {
            mammoth.extractRawText({arrayBuffer: event.target.result})
                .then(function(result) {
                    parsedText = splitTextIntoSentences(result.value)
                })
                .catch(function(err) {
                    console.error(err)
                });
        };
        reader.readAsArrayBuffer(file)
    } else if (file.type === "text/plain") {
        let reader = new FileReader()
        reader.readAsText(file)

        reader.onload = function () {
            // Возвращает из текста массив строк по 4 предложения в каждом
            parsedText = splitTextIntoSentences(reader.result)
        }

        reader.onerror = function () {
            console.error(reader.error)
            node.innerHTML = 'Ошибка запроса'
        }
    } else {
        alert('Неподдерживаемый тип файла')
    }
}

function readTextarea() {
    if (node.rows.length > 0) {
        node.deleteRow(0)
        node.deleteRow(0)
    }

    review.classList.remove('app__review__visible')
    review.classList.add('app__review__hidden')

    checkButton.disabled = true

    const textarea = document.getElementById('textarea')
    let textareaValue = textarea.value
    const value = selectList.value

    if (textareaValue === '') {
        sendMessage(parsedText, value)
    } else {
        if (!textareaValue[textareaValue.length - 1].match(/[.|?|!]/)) {
            textareaValue += '.'
        }
    
        // Возвращает из текста массив строк по 4 предложения в каждом
        const inputArr = splitTextIntoSentences(textareaValue)
        sendMessage(inputArr, value)
    }
}

function sendMessage(userInput, model) {
    result = []
    if (userInput.length > 0) {
        fetch(urlMessage, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ utterance: userInput, model })
        })
            .then((res) => res.json())
            .then((res) => {
                for (let i = 0; i <= res.reply.length - 1; i++) {
                    result.push([ userInput[i], res.reply[i]])
                }

                if (result.length > 0) {
                    let newHeaderRow = node.insertRow(0)
                    let newPreviewRow = node.insertRow(1)

                    let newHeaderCell0 = newHeaderRow.insertCell(0)
                    let newHeaderCell1 = newHeaderRow.insertCell(1)
                    let newPreviewCell0 = newPreviewRow.insertCell(0)
                    let newPreviewCell1 = newPreviewRow.insertCell(1)

                    let newHeaderText0 = document.createTextNode('Текст')
                    let newHeaderText1 = document.createTextNode('Значение')
                    let newPreviewText0 = document.createTextNode(result[0][0])
                    let newPreviewText1 = document.createTextNode(result[0][1])

                    newHeaderCell0.appendChild(newHeaderText0)
                    newHeaderCell1.appendChild(newHeaderText1)
                    newPreviewCell0.appendChild(newPreviewText0)
                    newPreviewCell1.appendChild(newPreviewText1)

                    review.classList.remove('app__review__hidden')
                    review.classList.add('app__review__visible')

                    checkButton.disabled = false
                    generatePDFButton.disabled = false
                }
            })
            .catch((err) => {
                console.error(err)
                node.innerHTML = 'Ошибка запроса'
            })
    }
}

function generatePDF() {
    if (result.length > 0) {
        const { jsPDF } = window.jspdf

        const doc = new jsPDF()

        doc.setFont('Roboto-Regular', 'normal');

        doc.autoTable({
            styles: {
                font: 'Roboto-Regular',
                fontStyle: 'normal'
            },
            head: [tableColumn],
            body: result,
            theme: 'striped',
            startY: 20
        });
    
        doc.save('report.pdf')
    } else console.error('Нет результатов проверки')
}

function sendReview() {
    const textarea = document.getElementById('textareaReview')

    fetch(urlReview, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ message: textarea.value })
    })
        .then((res) => res.json())
        .then(() => textarea.value = '')
        .catch((err) => {
            console.error(err)
            node.innerHTML = 'Ошибка запроса'
        })
}