const domToPdf = require('dom-to-pdf')

const createPDF = (name: string) => {
    console.log('imported function: create pdf')
    const page = document.querySelector('main')
    const options = {
        filename: `${name}.pdf`,
        compression: 'FAST',
        excludeClassNames: ['absolute'],
        overrideWidth: 800,
    }
    domToPdf(page, options, function() {
        console.log('pdf created')
    })
}

export default createPDF