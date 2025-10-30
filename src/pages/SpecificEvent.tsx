import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getEventById, eventUtils, type Event } from "../api/event";

const SpecificEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Event ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getEventById(id);

        if (response.success && response.data) {
          // Handle different response structures
          let eventData: Event;
          if (response.data.event) {
            eventData = response.data.event;
          } else {
            eventData = response.data as Event;
          }

          console.log("Fetched event:", eventData);
          setEvent(eventData);
        } else {
          setError(response.error || "Failed to fetch event details");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Parse artist lineup
  const getArtistLineup = (artistLineup: string | string[]) => {
    if (Array.isArray(artistLineup)) {
      return artistLineup.join(", ");
    }
    if (typeof artistLineup === "string") {
      try {
        const parsed = JSON.parse(artistLineup);
        return Array.isArray(parsed) ? parsed.join(", ") : artistLineup;
      } catch {
        return artistLineup;
      }
    }
    return "Various Artists";
  };

  // Parse tickets data
  const getTickets = (ticketsData: string | unknown[]) => {
    if (Array.isArray(ticketsData)) {
      return ticketsData;
    }
    if (typeof ticketsData === "string") {
      try {
        const parsed = JSON.parse(ticketsData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full min-h-screen px-10 py-2 mx-auto bg-black text-opacity-35">
        <Navbar />
        <main className="flex-1 px-2 py-10 md:px-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-800 rounded mb-8 w-2/3"></div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 mb-14">
              <div className="flex flex-col gap-6">
                <div className="w-full h-80 bg-gray-800 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
              <div className="bg-[#101010] rounded-lg p-6">
                <div className="h-6 bg-gray-800 rounded mb-4 w-1/4"></div>
                <div className="bg-[#1A1A1A] rounded-lg h-[300px]"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col w-full min-h-screen px-10 py-2 mx-auto bg-black text-opacity-35">
        <Navbar />
        <main className="flex-1 px-2 py-10 md:px-10">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error || "Event not found"}</p>
            <Link
              to="/events"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tickets = getTickets(event.tickets || "[]");
  const artistLineup = getArtistLineup(event.artist_lineup || []);
  const venueName = eventUtils.getVenueName(event);
  const venueLocation = event.venue?.location || "";
  const mapQuery = encodeURIComponent(`${venueName} ${venueLocation}`.trim());
  const mapsEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const artistArray: string[] = (() => {
    const lineup = event.artist_lineup || [] as any;
    if (Array.isArray(lineup)) return lineup;
    if (typeof lineup === 'string') {
      try {
        const parsed = JSON.parse(lineup);
        if (Array.isArray(parsed)) return parsed;
        return lineup.split(',').map(s => s.trim()).filter(Boolean);
      } catch {
        return lineup.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  })();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`Check out ${event.title} at ${venueName}`);
  const encodedUrl = encodeURIComponent(currentUrl);
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twShare = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
  const waShare = `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`;
  return (
    <div className="flex flex-col w-full min-h-screen px-10 py-2 mx-auto bg-black text-opacity-35">
      <Navbar />
      <main className="flex-1 px-2 py-10 md:px-10">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-semibold text-pink-500">
            Discover Events
          </h2>
          <p className="text-gray-400">
            Discover and purchase various tickets on different events of your
            preference
          </p>
        </div>
        <div className="flex gap-3 mb-6 text-3xl font-bold text-white">
          <Link
            to="/events"
            className="rounded-full bg-[#23232B] hover:bg-primary/20 text-[#CDCDE0] p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h3>{event.title}</h3>
        </div>

        {/* Event Details and Location */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 mb-14">
          {/* Left: Image + Info */}
          <div className="flex flex-col gap-6">
            <div className="w-full h-80 bg-gray-800 rounded-lg overflow-hidden">
              {!imageError && eventUtils.getEventImageUrl(event) ? (
                <img
                  src={eventUtils.getEventImageUrl(event)!}
                  alt={event.title}
                  className="object-cover w-full h-full"
                  onError={() => {
                    console.log("Event image failed to load:", eventUtils.getEventImageUrl(event));
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">No Image Available</div>
                    <div className="text-gray-600 text-sm">{event.title}</div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="gap-3 text-gray-400">
                Artists{" "}
                <span className="ml-32 font-semibold text-gray-400">
                  {artistLineup || "Various Artists"}
                </span>
              </p>
              <p className="text-gray-400">
                Date{" "}
                <span className="ml-32 font-normal text-gray-400">
                  {formatDate(event.date)}
                </span>
              </p>
              <p className="text-gray-400">
                Venue{" "}
                <span className="ml-[120px] font-semibold text-gray-400">
                  {eventUtils.getVenueName(event)}
                </span>
              </p>
            </div>
            {event.description && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  About This Event
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Lineup */}
            {artistArray.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-2">Lineup</h4>
                <div className="flex flex-wrap gap-2">
                  {artistArray.map((name, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm bg-[#1A1A1A] text-gray-200 border border-gray-800">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Good to know */}
            <div className="mt-6 bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Good to know</h4>
              <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                <li>Please arrive at least 30 minutes before start time for smooth entry.</li>
                <li>Bring a valid ID for age-restricted areas and ticket verification.</li>
                <li>All sales are final unless the event is canceled or rescheduled.</li>
                <li>Bag checks may be conducted at the venue entrance.</li>
              </ul>
            </div>

            {/* Share */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-gray-400 text-sm">Share:</span>
              <a href={fbShare} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 rounded bg-[#1A1A1A] text-blue-400 border border-gray-800 hover:bg-[#232323]">Facebook</a>
              <a href={twShare} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 rounded bg-[#1A1A1A] text-sky-400 border border-gray-800 hover:bg-[#232323]">Twitter</a>
              <a href={waShare} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 rounded bg-[#1A1A1A] text-green-400 border border-gray-800 hover:bg-[#232323]">WhatsApp</a>
            </div>
          </div>

          {/* Right: Location Map */}
          <div className="bg-[#101010] rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="mb-2 text-lg font-semibold text-white">Location</h3>
              <a
                href={mapsExternalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
                title="Open in Google Maps"
              >
                View on Maps
              </a>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg overflow-hidden h-full min-h-[300px]">
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                loading="lazy"
                className="w-full h-full border-0 rounded-lg"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Event Location"
              />
            </div>
            <div className="text-sm text-gray-300">
              <div className="font-medium text-white">{venueName}</div>
              {venueLocation && <div className="text-gray-400">{venueLocation}</div>}
              {event.venue?.capacity && (
                <div className="text-gray-500">Capacity: {event.venue.capacity.toLocaleString()} people</div>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="p-4 bg-transparent rounded-lg md:px-1 md:py-10">
          <h3 className="text-[#CDCDE0] bg-[#1A1A1A]  px-6 py-2 rounded-full text-lg font-semibold inline-block mb-6 shadow-sm">
            Tickets
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {tickets.length > 0 ? (
              tickets.map((ticket, idx) => (
                <div
                  key={idx}
                  className="bg-[#181818] rounded-xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 transform hover:scale-105"
                >
                  {/* Title and Left Count */}
                  <div className="flex flex-wrap items-center justify-between gap-y-1">
                    <div className="font-semibold text-white">
                      {ticket.type}
                    </div>
                    <div className="text-sm text-gray-400">
                      {ticket.quantity || 0} left
                    </div>
                  </div>

                  {/* Price and Buy Button */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                    <div className="text-lg font-bold text-white">
                      {ticket.price} Rwf
                    </div>
                    <button className="px-6 py-2 text-sm font-semibold text-pink-500 transition bg-white rounded-full hover:bg-pink-100">
                      Buy
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400 text-lg mb-2">
                  No tickets available
                </p>
                <p className="text-gray-500 text-sm">
                  Tickets for this event are not currently available for
                  purchase.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* More About This Event */}
        <section className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* About & Policies */}
          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800 lg:col-span-2">
            <h3 className="text-white text-lg font-semibold mb-4">More About This Event</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Experience {event.title} at {venueName}. {artistArray.length > 0 ? `Featuring ${artistArray.join(', ')}.` : ''} Enjoy great vibes, immersive performances, and an unforgettable atmosphere.
              </p>
              <div>
                <h4 className="text-white font-semibold mb-2">Policies</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Entry may require a valid ID; underage access may be restricted.</li>
                  <li>Tickets are non-refundable unless the event is canceled or rescheduled.</li>
                  <li>No outside food or beverages unless otherwise stated by the venue.</li>
                  <li>Professional cameras or recording equipment may be restricted.</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Accessibility</h4>
                <p className="text-sm">The venue aims to be accessible to all guests. For specific accommodations, please contact the venue ahead of time.</p>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800">
            <h3 className="text-white text-lg font-semibold mb-4">Event Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span className="text-gray-500">When</span>
                <span className="text-gray-200">{formatDate(event.date)} — {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="text-gray-500">Where</span>
                <span className="text-gray-200 text-right">
                  {venueName}
                  {venueLocation ? `, ${venueLocation}` : ''}
                </span>
              </div>
              {event.venue?.capacity && (
                <div className="flex justify-between text-gray-400">
                  <span className="text-gray-500">Capacity</span>
                  <span className="text-gray-200">{event.venue.capacity.toLocaleString()} people</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span className="text-gray-500">Dress Code</span>
                <span className="text-gray-200">Casual / Smart Casual</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="text-gray-500">Parking</span>
                <span className="text-gray-200">Available near venue (subject to availability)</span>
              </div>
              <div className="pt-3 border-t border-gray-800">
                <a href={mapsExternalUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Get Directions</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpecificEvent;
