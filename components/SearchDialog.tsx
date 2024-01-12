import exp from "constants"
import { Button } from "flowbite-react"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { CommentThread } from "pages/api/commentThread"
import React from "react"
import { Markdown } from "./content/Content"
import { Modal } from "flowbite-react"
import { createPortal } from "react-dom"
import { BiCommentAdd } from "react-icons/bi"
import { useTextSelection } from "use-text-selection"
import { SearchResult } from "lib/search/vectorDb"
import { Card } from "flowbite-react"
import { atom, useRecoilState } from "recoil"
import SearchBar from "components/forms/SearchBar"

export const searchQueryState = atom({
  key: "searchQueryState",
  default: false,
})

export const searchResultsState = atom({
  key: "searchResultsState",
  default: [] as SearchResult[],
})

interface SearchProps {
  onClose: () => void
}

export const SearchDialog: React.FC<SearchProps> = ({ onClose }) => {
  const [searchResults, setSearchResults] = useRecoilState(searchResultsState)
  const [isOpen, setIsOpen] = useRecoilState(searchQueryState)

  return (
    <Modal dismissible={true} show={isOpen} onClose={onClose} initialFocus={1} size="7xl">
      <Modal.Header>Search Course Material</Modal.Header>
      <SearchBar />
      <Modal.Body>
        <ul>
          {searchResults.map((result) => (
            <li key={result.id}>
              <Card className="rounded-none" href={result.url ?? ""}>
                <h6 className="font-bold tracking-tight text-gray-800 dark:text-white">{`${result.course} : ${result.page}`}</h6>
                <h2 className="text-sm2 text-gray-600 dark:text-gray-400">{result.title}</h2>
                <Markdown markdown={result.content as string} />
              </Card>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  )
}
