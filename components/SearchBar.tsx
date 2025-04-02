import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { usePathname, useSearchParams } from 'next/navigation';

//defining the type for props that SearchBar will receive
interface SearchBarProps {
  onSearch: (searchQuery: string) => Promise<void>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    if (query) {
      setSearchQuery(query); // Set the search query from URL if available
    }
  }, []); 

  //check if user entered a query and calling onsearch to fetch results
  const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      // Call the onSearch function with the search query
      await onSearch(searchQuery.trim());
  }
  };

  // Use effect to clear searchQuery when the user navigates to home
  useEffect(() => {
    if (pathname === '/') {
      setSearchQuery(''); // Clear the search query when at home
    }
  }, [pathname]);


  return (
    <form onSubmit={handleSearchSubmit} style={styles.form}>
      <input
        type="text"
        placeholder="Search posts or user..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search posts"
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        <FiSearch />
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background
    borderRadius: '25px', // Rounded corners
    padding: '5px 10px', // Add some padding
    width: '100%',
    maxWidth: '400px', // Optional: max width for the search bar
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Optional: subtle shadow
  },
  input: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    padding: '8px',
    fontSize: '16px',
    borderRadius: '25px',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: '#333',
  },
};

export default SearchBar;
