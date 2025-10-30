import EventCard from './EventCard';
import { eventUtils, type Event } from '../../api/event';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  search?: string;
  sort?: 'Latest' | 'Oldest' | 'Popular';
  category?: string;
  venue?: string;
  day?: string;
  price?: string;
}

const EventList = ({ events, isLoading, search = '', sort = 'Latest', category, venue, day, price }: EventListProps) => {
  // Helper function to extract category from event
  const getEventCategory = (event: Event): string => {
    const title = event.title.toLowerCase();
    const description = event.description.toLowerCase();
    
    if (title.includes('music') || title.includes('concert') || title.includes('band') || 
        description.includes('music') || description.includes('concert')) return 'Music';
    if (title.includes('comedy') || title.includes('stand up') || 
        description.includes('comedy')) return 'Comedy';
    if (title.includes('food') || title.includes('restaurant') || title.includes('culinary') ||
        description.includes('food')) return 'Food';
    if (title.includes('business') || title.includes('conference') || title.includes('workshop') ||
        description.includes('business')) return 'Business';
    if (title.includes('art') || title.includes('gallery') || title.includes('exhibition') ||
        description.includes('art')) return 'Art';
    return 'Music'; // Default category
  };

  // Helper function to get day category
  const getEventDay = (event: Event): string => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (eventDate.toDateString() === today.toDateString()) return 'Today';
    if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (eventDate <= nextWeek) return 'This Week';
    return 'Later';
  };

  // Helper function to get price range
  const getEventPriceRange = (event: Event): string => {
    if (event.tickets && event.tickets.length > 0) {
      const minPrice = Math.min(...event.tickets.map(t => t.price));
      if (minPrice <= 10000) return '0-10000 Rwf';
      if (minPrice <= 50000) return '10000-50000 Rwf';
      return '50000+ Rwf';
    }
    return '0-10000 Rwf'; // Default
  };

  // Transform events to match EventCard props
  const transformedEvents = events.map(event => ({
    id: eventUtils.getEventId(event) || event.event_id || '',
    title: event.title,
    date: new Date(event.date).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }),
    location: eventUtils.getVenueLocation(event),
    image: eventUtils.getEventImageUrl(event) || '/event1.png', // Fallback image
  }));

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2">
        {Array(6).fill(null).map((_, idx) => (
          <div key={idx} className="bg-[#101010] rounded-lg p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-800 rounded mb-2"></div>
            <div className="h-3 bg-gray-800 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transformedEvents.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-2">No events found</p>
        <p className="text-gray-500 text-sm">
          {search || category !== 'All' || venue !== 'All' || day !== 'All Days' 
            ? 'Try adjusting your search or filter criteria' 
            : 'No events are currently available'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2">
      {transformedEvents.map((event, idx) => (
        <EventCard key={event.id || idx} {...event} />
      ))}
    </div>
  );
};

export default EventList;