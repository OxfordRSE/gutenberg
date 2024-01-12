import { Button, Label, TextInput } from "flowbite-react"
import { BiSearch } from "react-icons/bi"
import React, { useEffect, useState, useRef } from "react"
import searchQuery from "lib/actions/searchMaterial"
import { SearchResult } from "lib/search/vectorDb"
import { useRecoilState } from "recoil"
import { searchQueryState, searchResultsState } from "components/SearchDialog"

function SearchBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useRecoilState(searchResultsState)
  const [isOpen, setIsOpen] = useRecoilState(searchQueryState)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)
    if (newQuery.length > 3) {
      searchQuery(newQuery).then((results) => {
        setSearchResults(results)
      })
    }
  }

  return (
    <div ref={ref} className="search-bar w-100" style={{ textAlign: "center" }}>
      <input
        className="w-[95%] h-10 px-5 pr-10 text-sm text-gray-700 placeholder-gray-600 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
        type="text"
        placeholder="Search Material"
        value={query}
        onChange={handleInputChange}
      />
    </div>
  )
}

export default SearchBar
