import { pages } from "next/dist/build/templates/app-page"

const domToPdf = require("dom-to-pdf")

const createPDF = (name: string) => {
  console.log("imported function: create pdf")
  const page = document.querySelector("main")
  const whitespace = document.createElement("br")
  page?.insertBefore(whitespace, page.firstChild);
  page!.classList.add("dark:bg-gray-800")
  const options = {
    filename: `${name}.pdf`,
    compression: "FAST",
    excludeClassNames: ["absolute"],
    overrideWidth: 800,
    scale: 1
  }
  domToPdf(page, options, function () {})
  page!.classList.remove("dark:bg-gray-800")
  page?.removeChild(whitespace)
}

export default createPDF
