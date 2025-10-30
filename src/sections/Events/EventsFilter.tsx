import CustomDropdown from '../../components/ui/CustomDropdown';

interface EventsFilterProps {
  categories: string[];
  venues: string[];
  days: string[];
  prices: string[];
  category: string;
  venue: string;
  day: string;
  price: string;
  onCategoryChange: (cat: string) => void;
  onVenueChange: (venue: string) => void;
  onDayChange: (day: string) => void;
  onPriceChange: (price: string) => void;
}

const EventsFilter = ({
  categories,
  venues,
  days,
  prices,
  category,
  venue,
  day,
  price,
  onCategoryChange,
  onVenueChange,
  onDayChange,
  onPriceChange,
}: EventsFilterProps) => {
  return (
    <aside className="w-full max-w-xs rounded-lg flex flex-col gap-2">
      <h2 className="text-lg font-bold text-white mb-4">Filters</h2>
      <div className="flex flex-col gap-3">
        <label className="block text-xs font-semibold text-gray-400 ">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`md:px-6 md:py-3 p-4 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none
                ${category === cat ? 'bg-primary text-white shadow-md' : 'bg-[#101010] text-white hover:bg-primary/80 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Venues */}
      <div className="flex flex-col gap-3">
        <label className="block text-xs text-gray-400 font-semibold">Venues</label>
        <div className="flex flex-wrap gap-2">
          {venues.map((v) => (
            <button
              key={v}
              onClick={() => onVenueChange(v)}
              className={`md:px-6 md:py-3 p-4 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none
                ${venue === v ? 'bg-primary text-white shadow-md' : 'bg-[#101010] text-white hover:bg-primary/80 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {/* Day */}
      <div className="flex flex-col gap-3">
        <label className="block text-xs text-gray-400 font-semibold ">Day</label>
        <CustomDropdown
          options={days}
          value={day}
          onChange={onDayChange}
          placeholder="Select Day"
        />
      </div>
      {/* Price Range */}
      <div className="flex flex-col gap-3">
        <label className="block text-xs text-gray-400 font-semibold">Price Range</label>
        <CustomDropdown
          options={prices}
          value={price}
          onChange={onPriceChange}
          placeholder="Select Price"
        />
      </div>
    </aside>
  );
};

export default EventsFilter; 