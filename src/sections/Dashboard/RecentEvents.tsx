import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { getAllEvents, eventUtils, type Event } from "../../api/event";

interface RecentEventsProps {
  onCreateEvent?: () => void;
  refreshKey?: number; // when changed, refetch events
}

const RecentEvents = ({ onCreateEvent, refreshKey }: RecentEventsProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await getAllEvents();

        if (response.success && response.data) {
          // Get the most recent 4 events, sorted by creation date
          const recentEvents = response.data.events
            .sort(
              (a, b) =>
                new Date(b.created_at || b.date).getTime() -
                new Date(a.created_at || a.date).getTime()
            )
            .slice(0, 4);

          setEvents(recentEvents);
        } else {
          setError(response.error || "Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Network error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [refreshKey]);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-[16px] font-semibold text-[#CDCDE0]">
          Recent Events
        </h3>
        <div className="flex justify-end">
          <button
            onClick={onCreateEvent}
            className="px-3 py-2 text-sm font-normal text-white transition-all rounded-lg md:px-5 bg-primary hover:bg-pink-600"
          >
            <span className="hidden md:inline">Create Event</span>
            <span className="md:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#101010] rounded-lg shadow-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-20 bg-gray-700 rounded mb-4"></div>
              <div className="h-3 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-[#CDCDE0] mb-4">No events found</p>
              <button
                onClick={onCreateEvent}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.event_id}
                className="bg-[#101010] rounded-lg shadow-lg flex flex-col"
              >
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-semibold text-[#CDCDE0]">
                    {event.title}
                  </span>
                  <button className="p-1 rounded-full hover:bg-[#23232B] text-[#CDCDE0]">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-4">
                  <div className="w-full h-20 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                    {eventUtils.getEventImageUrl(event) ? (
                      <img
                        src={eventUtils.getEventImageUrl(event)}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          const imgEl = e.currentTarget as HTMLImageElement;
                          imgEl.style.display = 'none';
                          const fallback = imgEl.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center" 
                      style={{ display: eventUtils.getEventImageUrl(event) ? 'none' : 'flex' }}
                    >
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#CDCDE0] text-[11px]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{eventUtils.formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#CDCDE0]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Venue : {eventUtils.getVenueName(event)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#CDCDE0]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        {event.artist_lineup.length} Artist
                        {event.artist_lineup.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {(() => {
                    const eventId = eventUtils.getEventId(event);
                    return eventId ? (
                      <Link
                        to={`/events-dashboard/${eventId}`}
                        className="bg-primary text-white rounded-md py-1.5 px-6 font-normal text-sm hover:bg-pink-600 transition-all mb-2"
                      >
                        View
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-600 text-gray-400 rounded-md py-1.5 px-6 font-normal text-sm cursor-not-allowed mb-2"
                      >
                        No ID
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Link
          to="/events-dashboard"
          className="font-normal text-white transition-all hover:text-primary"
        >
          See more
        </Link>
      </div>
    </section>
  );
};

export default RecentEvents;
