import { Button, Label, TextInput } from 'flowbite-react';
import { BiSearch } from 'react-icons/bi';
import React, { useEffect, useState } from 'react';
import searchQuery from 'lib/actions/searchMaterial';

interface SearchResult {
    id: string;
    content: string;
    title: string;
    url: string;
  }
  

function SearchBar() {
    const [query, setQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
  
    useEffect(() => {
      // Fetch the embedding vector
    }, []);
  
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = event.target.value;
      setQuery(newQuery);
      console.log(newQuery)
      // Call the searchVector function when the input changes
        searchQuery(newQuery).then((results) => {
            setSearchResults(results);
            setIsOpen(true);
        });
    };
  
    return (
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleInputChange}
        />
        {isOpen && (
          <div className="search-results">
            {searchResults.map((result) => (
              <div key={result.id} className="search-result">
                {result.name}
                {/* Add other result properties as needed */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default SearchBar;
