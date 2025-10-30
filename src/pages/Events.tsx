import { useState, useEffect } from "react";
import EventList from "../sections/Events/EventList";
import EventsFilter from "../sections/Events/EventsFilter";
import CustomDropdown from "../components/ui/CustomDropdown";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getAllEvents, type Event } from "../api/event";
import { getAllVenues, type Venue } from "../api/venue";

const sortOptions = ["Latest", "Oldest", "Popular"];

interface FilterCounts {
  categories: Record<string, number>;
  venues: Record<string, number>;
  total: number;
}

const Events = () => {

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"Latest" | "Oldest" | "Popular">("Latest");
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  // Dynamic filter options from backend
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [venues, setVenues] = useState<string[]>(["All"]);
  const [days] = useState(["All Days", "Today", "Tomorrow", "This Week"]);
  const [prices] = useState(["All Prices", "0-10000 Rwf", "10000-50000 Rwf", "50000+ Rwf"]);
  const [category, setCategory] = useState("All");
  const [venue, setVenue] = useState("All");
  const [day, setDay] = useState("All Days");
  const [price, setPrice] = useState("All Prices");

  const [isLoading, setIsLoading] = useState(true);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    categories: {},
    venues: {},
    total: 0
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'eventsRefreshKey') {
        setEventsRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Helper function to categorize events
  const getEventCategory = (event: Event): string => {
    const title = (event as any).title?.toLowerCase?.() || "";
    const description = (event as any).description?.toLowerCase?.() || "";
    if (title.includes('music') || title.includes('concert') || title.includes('band') || description.includes('music') || description.includes('concert')) return 'Music';
    if (title.includes('comedy') || title.includes('stand up') || description.includes('comedy')) return 'Comedy';
    if (title.includes('food') || title.includes('restaurant') || title.includes('culinary') || description.includes('food')) return 'Food';
    if (title.includes('business') || title.includes('conference') || title.includes('workshop') || description.includes('business')) return 'Business';
    if (title.includes('art') || title.includes('gallery') || title.includes('exhibition') || description.includes('art')) return 'Art';
    return 'Music';
  };

  // Helper function to get venue name from event
  const getEventVenueName = (event: Event): string => {
    // Support both embedded venue object or flat structure
    const venueName = (event as any)?.venue?.name || (event as any)?.venue_name || '';
    return venueName || 'Unknown Venue';
  };

  // Calculate filter counts
  const calculateFilterCounts = (events: Event[]): FilterCounts => {
    const categoryCounts: Record<string, number> = {};
    const venueCounts: Record<string, number> = {};
    events.forEach(ev => {
      const evCategory = getEventCategory(ev);
      const evVenue = getEventVenueName(ev);
      categoryCounts[evCategory] = (categoryCounts[evCategory] || 0) + 1;
      venueCounts[evVenue] = (venueCounts[evVenue] || 0) + 1;
    });
    return { categories: categoryCounts, venues: venueCounts, total: events.length };
  };

  // Fetch events and dynamic filter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch events
        const eventsResponse = await getAllEvents();
        let eventsList: Event[] = [];
        if (eventsResponse.success && eventsResponse.data) {
          if (Array.isArray(eventsResponse.data)) {
            eventsList = eventsResponse.data as unknown as Event[];
          } else if ((eventsResponse.data as any).events) {
            eventsList = (eventsResponse.data as any).events as Event[];
          }
        }

        // Fetch venues for dynamic venue filter
        const venuesResponse = await getAllVenues();
        let venuesList: Venue[] = [];
        if (venuesResponse.success && venuesResponse.data?.venues) {
          venuesList = venuesResponse.data.venues as Venue[];
        }

        // Calculate filter counts
        const counts = calculateFilterCounts(eventsList);
        setFilterCounts(counts);

        // Extract unique categories from events
        const uniqueCategories = Object.keys(counts.categories);
        const categoriesWithCounts = ['All'].concat(uniqueCategories);
        setCategories(categoriesWithCounts);

        // Set dynamic venues
        const venueNames = venuesList.map(v => v.name);
        const venuesWithCounts = ['All'].concat(venueNames);
        setVenues(venuesWithCounts);

        setAllEvents(eventsList);
        setTotalEvents(eventsList.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventsRefreshKey]);

  // Compute filtered list
  const getFilteredEvents = () => {
    return allEvents.filter(event => {
      const searchL = search.toLowerCase();
      const title = (event as any).title?.toLowerCase?.() || '';
      const description = (event as any).description?.toLowerCase?.() || '';

      const matchesSearch = search === '' || 
        title.includes(searchL) ||
        description.includes(searchL) ||
        getEventVenueName(event).toLowerCase().includes(searchL);

      // Category filter
      const eventCategory = getEventCategory(event);
      const matchesCategory = category === 'All' || eventCategory === category;

      // Venue filter
      const eventVenue = getEventVenueName(event);
      const matchesVenue = venue === 'All' || eventVenue === venue;

      // Day filter
      const matchesDay = day === 'All Days' || (() => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        if (day === 'Today') {
          return eventDate.toDateString() === today.toDateString();
        } else if (day === 'Tomorrow') {
          return eventDate.toDateString() === tomorrow.toDateString();
        } else if (day === 'This Week') {
          return eventDate >= today && eventDate <= nextWeek;
        }
        return true;
      })();

      // Price filter (simplified - you may want to get actual ticket prices)
      const matchesPrice = price === 'All Prices' || (() => {
        if (event.tickets && event.tickets.length > 0) {
          const minPrice = Math.min(...event.tickets.map(t => t.price));
          if (price === '0-10000 Rwf') return minPrice <= 10000;
          if (price === '10000-50000 Rwf') return minPrice > 10000 && minPrice <= 50000;
          if (price === '50000+ Rwf') return minPrice > 50000;
        }
        return true; // Default if no ticket info
      })();

      return matchesSearch && matchesCategory && matchesVenue && matchesDay && matchesPrice;
    });
  };

  // Sort filtered events
  const getSortedEvents = (events: Event[]) => {
    const sorted = [...events];
    if (sort === 'Latest') {
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'Oldest') {
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sort === 'Popular') {
      return sorted.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
    }
    return sorted;
  };

  // Get paginated events
  const getPaginatedEvents = () => {
    const filtered = getFilteredEvents();
    const sorted = getSortedEvents(filtered);
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return {
      events: sorted.slice(startIndex, endIndex),
      totalFiltered: sorted.length,
      totalPages: Math.ceil(sorted.length / eventsPerPage)
    };
  };

  const { events: paginatedEvents, totalFiltered, totalPages } = getPaginatedEvents();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, venue, day, price, sort]);

  // Format category/venue names with counts
  const formatFilterOption = (option: string, type: 'category' | 'venue'): string => {
    if (option === 'All') {
      return `All (${totalFiltered})`;
    }
    const count = type === 'category' ? filterCounts.categories[option] : filterCounts.venues[option];
    return count ? `${option} (${count})` : option;
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col mx-auto px-10 py-2 text-opacity-35">
      <Navbar />
      <main className="flex-1 px-2 md:px-10 py-10">
        <h1 className="text-3xl font-bold text-primary mb-2 text-left">
          Upcoming Events {totalFiltered > 0 && `(${totalFiltered})`}
        </h1>
        <p className="text-[#CDCDE0] text-sm mb-8 text-left">
          Discover and purchase tickets to{" "}
          {totalFiltered > 0 ? totalFiltered : "amazing"} events at
          your convenience.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          <div className="w-full lg:w-1/4">
            <EventsFilter
              categories={categories.map(cat => formatFilterOption(cat, 'category'))}
              venues={venues.map(ven => formatFilterOption(ven, 'venue'))}
              days={days}
              prices={prices}
              category={formatFilterOption(category, 'category')}
              venue={formatFilterOption(venue, 'venue')}
              day={day}
              price={price}
              onCategoryChange={(cat) => setCategory(cat.split(' (')[0])}
              onVenueChange={(ven) => setVenue(ven.split(' (')[0])}
              onDayChange={setDay}
              onPriceChange={setPrice}
            />
          </div>
          
          <div className="w-full lg:w-3/4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <div className="relative w-full sm:w-1/2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CDCDE0] pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search Event"
                  className="w-full bg-[#101010] text-[#CDCDE0] rounded-lg px-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-md transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto">
                <CustomDropdown
                  options={sortOptions}
                  value={sort}
                  onChange={(val) =>
                    setSort(val as "Latest" | "Oldest" | "Popular")
                  }
                  placeholder="Sort by"
                />
              </div>
            </div>

            {/* Events List */}
            <EventList
              events={paginatedEvents}
              isLoading={isLoading}
              search={search}
              sort={sort}
              category={category}
              venue={venue}
              day={day}
              price={price}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-[#101010] text-[#CDCDE0] rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-[#101010] text-[#CDCDE0] hover:bg-primary/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-[#101010] text-[#CDCDE0] rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Results info */}
            {totalFiltered > 0 && (
              <div className="text-center text-[#CDCDE0] text-sm mt-4">
                Showing {((currentPage - 1) * eventsPerPage) + 1} to {Math.min(currentPage * eventsPerPage, totalFiltered)} of {totalFiltered} events
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;