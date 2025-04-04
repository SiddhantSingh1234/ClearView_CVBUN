import { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

const CategoryFilter = ({ categories, selectedCategories, onCategoryChange }: CategoryFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const displayedCategories = isExpanded ? categories : categories.slice(0, 5);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {displayedCategories.map(category => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
              selectedCategories.includes(category)
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            aria-pressed={selectedCategories.includes(category)}
          >
            {category}
          </button>
        ))}
        {categories.length > 5 && (
          <button
            onClick={toggleExpand}
            className="px-3 py-1 rounded-full text-sm bg-background border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Show Less' : `+${categories.length - 5} More`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;