import { Button, Label, TextInput } from 'flowbite-react';
import { BiSearch } from 'react-icons/bi';
import React, { useEffect, useState, useRef } from 'react';
import searchQuery from 'lib/actions/searchMaterial';
import { SearchResult } from 'lib/search/vectorDb';
import { SearchResultsPopover } from 'components/content/SearchResultsPopover'

function SearchBar() {
    const ref = useRef<HTMLDivElement>(null)
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.target.value;
      setQuery(newQuery);
      console.log(newQuery)
      if (newQuery.length > 4)  {
        searchQuery(newQuery).then((results) => {
          setSearchResults(results);
          setIsOpen(true);
      })}
      else {
        setIsOpen(false);
      }
    };
  
    return (
      
      <div ref={ref} className="search-bar">
        <input
          type="text"
          placeholder="Search Material"
          value={query}
          onChange={handleInputChange}
        />
        {isOpen && <SearchResultsPopover target={ref} results={searchResults} isOpen={isOpen}/>}
      </div>
        
      
    )}  

export default SearchBar;
