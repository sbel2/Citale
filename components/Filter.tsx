import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from 'app/lib/definitions';
import { IoIosArrowDown } from "react-icons/io";

interface FilterProps {
  onFilter: (option: string, location: string, price: string, category: string) => Promise<void>;
}

const FilterButton: React.FC<FilterProps> = ({ onFilter }) => {
  const [filterActivities, setFilterActivities] = useState('All');
  const [filterLocations, setFilterLocations] = useState('All');
  const [filterPrice, setFilterPrice] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const filterParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState<{
    Price: string[];
    Activity: string[];
    Location: string[];
  }>({
    Price: [],
    Activity: [],
    Location: [],
  });

  const dropdownRefs = {
    Activity: useRef<HTMLDivElement | null>(null),
    Location: useRef<HTMLDivElement | null>(null),
    Price: useRef<HTMLDivElement | null>(null),
  };
  const buttonRefs = {
    Activity: useRef<HTMLButtonElement | null>(null),
    Location: useRef<HTMLButtonElement | null>(null),
    Price: useRef<HTMLButtonElement | null>(null),
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        Object.values(dropdownRefs).every(
          (ref) => ref.current && !ref.current.contains(event.target as Node)
        ) &&
        Object.values(buttonRefs).every(
          (ref) => ref.current && !ref.current.contains(event.target as Node)
        )
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: activitiesData, error: activitiesError } = await supabase.from('posts').select('category');
        const { data: locationsData, error: locationsError } = await supabase.from('posts').select('location');
        const { data: priceData, error: priceError } = await supabase.from('posts').select('price');

        if (activitiesError || locationsError || priceError) {
          console.error('Error fetching categories:', activitiesError || locationsError || priceError);
          return;
        }

        setCategories({
          Activity: activitiesData 
          ? ["All",...new Set(
              activitiesData
                  .map(item => item.category)
                  .filter(Boolean)
                  .flatMap(category => category.split(',').map((cat: string) => cat.trim()))
          )].sort()
          : ["All"],
          Location: locationsData ? ["All",...new Set(locationsData.map((item) => item.location).filter(Boolean))].sort() : ["All"],
          Price: priceData
            ? ["All",...new Set(priceData.map((item) => item.price).filter(Boolean))].sort((a, b) => (a === "All" ? -1 : 
              b === "All" ? 1 : 
              a === "Free" ? -1 : 
              b === "Free" ? 1 : 
              a.localeCompare(b)))
            : ["All"],
        });
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchCategories();
  }, []);

  const updateFilterParams = (newOption: string, newLocation: string, newPrice: string) => {
    const queryParams = new URLSearchParams(window.location.search);
    newOption !== 'All' ? queryParams.set('option', newOption) : queryParams.delete('option');
    newLocation !== 'All' ? queryParams.set('location', newLocation) : queryParams.delete('location');
    newPrice !== 'All' ? queryParams.set('price', newPrice) : queryParams.delete('price');
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  useEffect(() => {
    const option = filterParams.get('option') || 'All';
    const location = filterParams.get('location') || 'All';
    const price = filterParams.get('price') || 'All';

    setFilterActivities(categories.Activity.includes(option) ? option : 'All');
    setFilterLocations(categories.Location.includes(location) ? location : 'All');
    setFilterPrice(categories.Price.includes(price) ? price : 'All');
  }, [filterParams, categories]);

  const handleFilterChange = useCallback(
    async (option: string, location: string, price: string, category: string) => {
      if (category === 'Activity') setFilterActivities(option);
      if (category === 'Location') setFilterLocations(location);
      if (category === 'Price') setFilterPrice(price);

      updateFilterParams(option, location, price);

      try {
        await onFilter(option, location, price, category);
      } catch (error) {
        console.error('Filter error:', error);
      }
    },
    [onFilter]
  );

  const resetFilters = () => {
    setFilterActivities('All');
    setFilterLocations('All');
    setFilterPrice('All');
    router.push(`/`);
  };

  const toggleDropdown = (category: string) => {
    setDropdownOpen(dropdownOpen === category ? null : category);
  };

  const FilterDropdown = ({ category, selected, options }: { category: string; selected: string; options: string[] }) => (
    <div className="relative mx-2 md:mx-4 z-20">
      <button
        className={`flex items-center justify-center z-10 w-25 md:w-32 px-3 py-2.5 text-center text-xs md:text-sm rounded-full transition-colors 
          ${selected !== 'All' ? 'bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} 
          gap-1 md:gap-3`}
        onClick={() => toggleDropdown(category)}
        ref={buttonRefs[category as keyof typeof buttonRefs]}
      >
        {selected === 'All' ? category : selected}
        <IoIosArrowDown />
      </button>
      {dropdownOpen === category && (
        <div
        className="absolute top-14 left-0 right-0 bg-white rounded drop-shadow-2xl shadow-2xl z-10 overflow-y-auto max-h-48 z-10"
          ref={dropdownRefs[category as keyof typeof dropdownRefs]}
        >
          {options.map((option) => (
            <div
              key={option}
              className="px-3 py-2.5 cursor-pointer hover:bg-gray-100 text-xs md:text-sm z-10"
              onClick={() => {
                handleFilterChange(
                  category === 'Activity' ? option : filterActivities,
                  category === 'Location' ? option : filterLocations,
                  category === 'Price' ? option : filterPrice,
                  category
                );
                setDropdownOpen(null); // Close dropdown when a category is selected
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );  


  return (
    <div className="bg-white flex justify-center items-center pt-5 pb-2 z-15">
      <FilterDropdown category="Activity" selected={filterActivities} options={categories.Activity} />
      <FilterDropdown category="Location" selected={filterLocations} options={categories.Location} />
      <FilterDropdown category="Price" selected={filterPrice} options={categories.Price} />

      <button
        className="ml-2 md:ml-5 w-25 md:w-32 px-3 py-2.5 bg-[#fd0000] text-white rounded-full cursor-pointer hover:bg-[#fd0000] text-center text-xs md:text-sm flex justify-center items-center"
        onClick={resetFilters}
      >
        Reset
      </button>
    </div>
  );
};

const FilterComponent: React.FC<FilterProps> = (props) => (
  <Suspense fallback={<div></div>}>
    <FilterButton {...props} />
  </Suspense>
);

export default FilterComponent;
