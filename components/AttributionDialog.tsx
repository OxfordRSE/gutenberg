import { Modal } from "flowbite-react"
import { Attribution } from "lib/material"
import React, { useEffect } from "react"
import { useEdges } from "reactflow"
import Image from "next/image"

interface LicenseProps {
  name: string
}

const License: React.FC<LicenseProps> = ({ name }) => {
  if (name === "CC-BY-4.0") {
    return (
      <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
        <Image
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by/4.0/88x31.png"
          width={88}
          height={31}
        />
      </a>
    )
  } else if (name == "CC-BY-SA-4.0") {
    return (
      <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">
        <Image
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png"
          width={88}
          height={31}
        />
      </a>
    )
  } else if (name == "CC-BY-NC-4.0") {
    return (
      <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">
        <Image
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png"
          width={88}
          height={31}
        />
      </a>
    )
  } else if (name == "CC-BY-NC-SA-4.0") {
    return (
      <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
        <Image
          alt="Creative Commons License"
          src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"
          width={88}
          height={31}
        />
      </a>
    )
  } else {
    return <>unknown</>
  }
}

interface CitationListProps {
  citations: Attribution[]
}

const CitationList: React.FC<CitationListProps> = ({ citations }) => {
  return (
    <div className="flex flex-col space-y-4">
      {citations.map((citation, i) => (
        <div key={i} className="flex items-center space-x-4">
          <a href={citation.url}>
            <Image src={citation.image} alt={citation.citation} className="h-40 w-40" width={88} height={31} />
          </a>
          <p className="text-lg font-normal text-gray-700 dark:text-gray-400">{citation.citation}</p>
          <License name={citation.license} />
        </div>
      ))}
    </div>
  )
}

interface CitationDialogProps {
  citations: Attribution[]
  isOpen: boolean
  onClose: () => void
}

const AttributionDialog: React.FC<CitationDialogProps> = ({ citations, isOpen, onClose }) => {
  // This is a hack to prevent the modal from rendering on the server
  const [mounted, setMounted] = React.useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const pageLicense = overallLicense(citations)

  return (
    <>
      {mounted ? (
        <Modal dismissible={true} show={isOpen} onClose={onClose}>
          <Modal.Header>Licensing and Attribution</Modal.Header>
          <Modal.Body>
            <div className="flex items-center justify-between pb-4">
              <p className="text-lg font-normal text-gray-800 dark:text-gray-300">
                {" "}
                This page is licenced under the {pageLicense} license{" "}
              </p>
              <License name={pageLicense} />
            </div>
            <p className="text-lg font-normal text-gray-800 dark:text-gray-300 pb-2">
              Material for this page derived from:
            </p>
            <CitationList citations={citations} />
          </Modal.Body>
        </Modal>
      ) : (
        <div style={{ display: "none" }}>
          <CitationList citations={citations} />
        </div>
      )}
    </>
  )
}

const overallLicense = (citations: Attribution[]) => {
  return citations
    .map((citation) => citation.license)
    .reduce((a: string, b: string) => {
      if (a === b) {
        return a
      }
      const hasSA = a.includes("SA") || b.includes("SA")
      const hasNC = a.includes("NC") || b.includes("NC")
      return `CC-BY${hasNC ? "-NC" : ""}${hasSA ? "-SA" : ""}-4.0`
    }, "CC-BY-4.0")
}

export default AttributionDialog
