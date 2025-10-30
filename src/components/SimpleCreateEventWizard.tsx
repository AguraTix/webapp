import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Building, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { createEvent, eventUtils, type TicketType } from "../api/event";
import { getAllVenues, venueUtils, type Venue } from "../api/venue";
import { imageUtils } from "../api/upload";
import CreateVenueModal from "./CreateVenueModal";
import CustomDropdown from "./ui/CustomDropdown";

interface SimpleCreateEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue_id: string;
  artist_lineup: string[];
  tickets: TicketData[];
  mainImageFile: File | null;
  mainImagePreview: string | null;
  additionalImageFiles: File[];
  additionalImagePreviews: string[];
}

interface TicketData {
  name: string;
  price: number;
  section_id: string;
  type: string; // Changed to string to allow dynamic types like 'vvip', 'vip', etc.
  quantity: number;
}

type WizardStep = 'venue' | 'event';

const SimpleCreateEventWizard: React.FC<SimpleCreateEventWizardProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('venue');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [venueSections, setVenueSections] = useState<Venue['sections']>([]);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "18:00",
    venue_id: "",
    artist_lineup: [""],
    tickets: [],
    mainImageFile: null,
    mainImagePreview: null,
    additionalImageFiles: [],
    additionalImagePreviews: [],
  });

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [showCreateVenueModal, setShowCreateVenueModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVenues();
    }
  }, [isOpen]);
  useEffect(() => {
    if (selectedVenue) {
      setVenueSections(selectedVenue.sections || []);
      // Auto-create tickets based on sections availability
      if (selectedVenue.sections && selectedVenue.sections.length > 0) {
        const initialTickets = selectedVenue.sections.map((section) => ({
          name: `${section.name} Ticket`,
          price: 50,
          section_id: section.section_id || "",
          type: section.name, // Preserve exact section name to satisfy backend validation
          quantity: 0,
        }));
        setFormData((prev) => ({ ...prev, tickets: initialTickets }));
      } else {
        // If no sections, create a regular ticket
        const regularTicket = [
          {
            name: "Regular",
            price: 50,
            section_id: "",
            type: "Regular",
            quantity: 0,
          },
        ];
        setFormData((prev) => ({ ...prev, tickets: regularTicket }));
      }
      setFormData((prev) => ({ ...prev, venue_id: selectedVenue.venue_id! }));
    }
  }, [selectedVenue]);

  const fetchVenues = async () => {
    try {
      setIsLoadingVenues(true);
      const response = await getAllVenues();
      if (response.success && response.data) {
        const venuesList = Array.isArray(response.data) ? response.data : response.data.venues || [];
        console.log("Venues received:", venuesList);
        setVenues(venuesList);
      } else {
        console.error("Failed to fetch venues:", response.error);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  const handleVenueCreated = (venue: Venue) => {
    setVenues(prev => [...prev, venue]);
    setSelectedVenue(venue);
    setShowCreateVenueModal(false);
  };

  const proceedToEventStep = () => {
    if (currentStep === 'venue' && selectedVenue) {
      setCurrentStep('event');
    }
  };

  const goBackToVenueStep = () => {
    if (currentStep === 'event') {
      setCurrentStep('venue');
    }
  };

  const handleArtistChange = (index: number, value: string) => {
    const newArtists = [...formData.artist_lineup];
    newArtists[index] = value;
    setFormData((prev) => ({
      ...prev,
      artist_lineup: newArtists,
    }));
  };

  const addArtist = () => {
    setFormData((prev) => ({
      ...prev,
      artist_lineup: [...prev.artist_lineup, ""],
    }));
  };

  const removeArtist = (index: number) => {
    if (formData.artist_lineup.length > 1) {
      const newArtists = formData.artist_lineup.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        artist_lineup: newArtists,
      }));
    }
  };

  const handleTicketChange = (
    index: number,
    field: keyof TicketData,
    value: string | number
  ) => {
    const newTickets = [...formData.tickets];
    newTickets[index] = {
      ...newTickets[index],
      [field]: field === "name" || field === "type" ? value : Number(value),
    };
    setFormData((prev) => ({
      ...prev,
      tickets: newTickets,
    }));
  };

  const addTicket = () => {
    const newTicket: TicketData = {
      name: "Regular",
      price: 50,
      section_id: "",
      type: "Regular",
      quantity: 0,
    };
    setFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
    }));
  };

  const removeTicket = (index: number) => {
    if (formData.tickets.length > 1) {
      const newTickets = formData.tickets.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        tickets: newTickets,
      }));
    }
  };

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await imageUtils.compressImage(file);
      const validationError = imageUtils.validateImageFile(compressedFile);
      if (validationError) {
        setErrors([validationError]);
        return;
      }

      const previewUrl = imageUtils.createPreviewUrl(compressedFile);
      setFormData((prev) => ({
        ...prev,
        mainImageFile: compressedFile,
        mainImagePreview: previewUrl,
      }));

      setErrors((prev) => prev.filter((error) => !error.includes("image")));
    } catch (error) {
      console.error("Error compressing image:", error);
      setErrors(["Failed to process image"]);
    }
  };

  const removeMainImage = () => {
    if (formData.mainImagePreview) {
      imageUtils.revokePreviewUrl(formData.mainImagePreview);
    }
    setFormData((prev) => ({
      ...prev,
      mainImageFile: null,
      mainImagePreview: null,
    }));
  };

  const handleAdditionalImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.additionalImageFiles.length + files.length > 5) {
      setErrors(["Maximum 5 additional images allowed"]);
      return;
    }

    try {
      const compressedFiles = await Promise.all(
        files.map((file) => imageUtils.compressImage(file))
      );

      for (const file of compressedFiles) {
        const validationError = imageUtils.validateImageFile(file);
        if (validationError) {
          setErrors([validationError]);
          return;
        }
      }

      const newPreviews = compressedFiles.map((file) =>
        imageUtils.createPreviewUrl(file)
      );

      setFormData((prev) => ({
        ...prev,
        additionalImageFiles: [
          ...prev.additionalImageFiles,
          ...compressedFiles,
        ],
        additionalImagePreviews: [
          ...prev.additionalImagePreviews,
          ...newPreviews,
        ],
      }));

      setErrors((prev) => prev.filter((error) => !error.includes("image")));
    } catch (error) {
      console.error("Error compressing images:", error);
      setErrors(["Failed to process images"]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    if (formData.additionalImagePreviews[index]) {
      imageUtils.revokePreviewUrl(formData.additionalImagePreviews[index]);
    }

    setFormData((prev) => ({
      ...prev,
      additionalImageFiles: prev.additionalImageFiles.filter(
        (_, i) => i !== index
      ),
      additionalImagePreviews: prev.additionalImagePreviews.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push("Event title is required");
    }

    if (!formData.description.trim()) {
      newErrors.push("Event description is required");
    }

    if (!formData.eventDate) {
      newErrors.push("Event date is required");
    } else {
      const eventDateTime = new Date(
        `${formData.eventDate}T${formData.eventTime}`
      );
      if (eventDateTime <= new Date()) {
        newErrors.push("Event date must be in the future");
      }
    }

    if (!formData.venue_id) {
      newErrors.push("Please select a venue");
    }

    const validArtists = formData.artist_lineup.filter((artist) =>
      artist.trim()
    );
    if (validArtists.length === 0) {
      newErrors.push("At least one artist is required");
    }

    const validTickets = formData.tickets.filter(
      (ticket) =>
        ticket.name.trim() &&
        ticket.price > 0 &&
        ticket.type.trim() && // Ensure type is not empty
        ticket.quantity >= 0
    );
    if (validTickets.length === 0) {
      newErrors.push("At least one valid ticket is required");
    }

    // Additional validation to ensure all sections have tickets
    if (venueSections.length > 0) {
      const sectionNames = new Set(venueSections.map(s => s.name.toLowerCase()));
      const ticketTypes = new Set(formData.tickets.map(t => t.type.toLowerCase()));
      for (const sectionName of sectionNames) {
        if (!ticketTypes.has(sectionName)) {
          newErrors.push(`Missing ticket type for section: ${sectionName}`);
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const validArtists = formData.artist_lineup.filter((artist) =>
        artist.trim()
      );
      const validTickets = formData.tickets.filter(
        (ticket) =>
          ticket.name.trim() && ticket.price > 0 && ticket.type.trim() && ticket.quantity >= 0
      );

      const eventData = eventUtils.formatEventDataForAPI({
        eventName: formData.title,
        eventDescription: formData.description,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        venue_id: formData.venue_id,
        artists: validArtists,
        tickets: validTickets,
        event_image: formData.mainImageFile,
        event_images: formData.additionalImageFiles,
      });

      console.log("Creating event with data:", eventData);
      console.log("Venue ID being sent:", eventData.venue_id);
      console.log("Main image file:", eventData.event_image);
      console.log("Additional image files:", eventData.event_images);
      console.log("Tickets with types:", validTickets);

      const response = await createEvent(eventData);

      if (response.success) {
        console.log("Event created successfully:", response.data);
        setIsSuccess(true);

        setTimeout(() => {
          onEventCreated?.();
          onClose();
          resetForm();
        }, 2000);
      } else {
        setErrors([response.error || "Failed to create event"]);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setErrors(["An unexpected error occurred"]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (formData.mainImagePreview) {
      imageUtils.revokePreviewUrl(formData.mainImagePreview);
    }
    formData.additionalImagePreviews.forEach((url) => {
      imageUtils.revokePreviewUrl(url);
    });

    setCurrentStep('venue');
    setSelectedVenue(null);
    setVenueSections([]);
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "18:00",
      venue_id: "",
      artist_lineup: [""],
      tickets: [],
      mainImageFile: null,
      mainImagePreview: null,
      additionalImageFiles: [],
      additionalImagePreviews: [],
    });
    setErrors([]);
    setIsSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181B] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Create Event
              </h2>
              <p className="text-[#CDCDE0] text-sm">
                Create a new event with tickets and images
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#CDCDE0] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div
              className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded-md"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-semibold text-sm">
                    Event Created Successfully!
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    General Admission tickets created with price Rwf{formData.tickets[0]?.price ?? 'N/A'}.
                    Quantity set by venue capacity.
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    Redirecting in 2 seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && !isSuccess && (
            <div
              className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md"
              role="alert"
            >
              {errors.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Step Indicator */}
          {!isSuccess && (
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${currentStep === 'venue' ? 'text-primary' : currentStep === 'event' ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'venue' ? 'bg-primary' : currentStep === 'event' ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Select Venue</span>
                </div>
                <div className={`w-16 h-0.5 ${currentStep === 'event' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <div className={`flex items-center ${currentStep === 'event' ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'event' ? 'bg-primary' : 'bg-gray-600'}`}>
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Create Event</span>
                </div>
              </div>
            </div>
          )}

          {!isSuccess && (
            <div className="flex flex-col gap-4">
              {/* Step 1: Venue Selection */}
              {currentStep === 'venue' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Select or Create a Venue</h3>
                    <p className="text-[#CDCDE0] text-sm">Choose an existing venue or create a new one for your event</p>
                  </div>

                  {isLoadingVenues ? (
                    <div className="w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm text-center">
                      Loading venues...
                    </div>
                  ) : (
                    <>
                      {venues.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-[#CDCDE0] mb-2">
                            Select Existing Venue
                          </label>
                          <CustomDropdown
                            options={venues.map(venue => `${venue.name} - ${venue.location}`)}
                            value={selectedVenue ? `${selectedVenue.name} - ${selectedVenue.location}` : ''}
                            onChange={(value) => {
                              const venue = venues.find(v => `${v.name} - ${v.location}` === value);
                              if (venue) handleVenueSelect(venue);
                            }}
                            placeholder="Select a venue"
                          />
                        </div>
                      )}

                      <div className="text-center">
                        <span className="text-[#CDCDE0] text-sm">or</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCreateVenueModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#23232B] text-[#CDCDE0] rounded-md hover:bg-[#2A2A2A] transition-colors border-2 border-dashed border-gray-600 hover:border-primary"
                      >
                        <Plus className="w-5 h-5" />
                        Create New Venue
                      </button>
                    </>
                  )}

                  {selectedVenue && (
                    <div className="bg-[#23232B] rounded-md p-4">
                      <h4 className="text-white font-medium mb-2">Selected Venue:</h4>
                      <p className="text-[#CDCDE0] text-sm">{selectedVenue.name}</p>
                      <p className="text-gray-400 text-xs">{selectedVenue.location}</p>
                      <p className="text-gray-400 text-xs">Capacity: {selectedVenue.capacity}</p>
                      
                      {venueSections.length > 0 ? (
                        <div className="mt-3">
                          <p className="text-gray-400 text-xs mb-1">Available Sections ({venueSections.length}):</p>
                          <div className="flex flex-wrap gap-1">
                            {venueSections.map((section, index) => (
                              <span 
                                key={index}
                                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                              >
                                {section.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-blue-400 text-xs mt-2">✓ No sections - General admission event</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={proceedToEventStep}
                      disabled={!selectedVenue}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Event
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Event Creation */}
              {currentStep === 'event' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Create Your Event</h3>
                    <p className="text-[#CDCDE0] text-sm">Fill in the event details and configure tickets</p>
                  </div>

                  {/* Selected Venue Summary */}
                  {selectedVenue && (
                    <div className="bg-[#23232B] rounded-md p-4 border border-primary/30 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{selectedVenue.name}</h4>
                          <p className="text-gray-400 text-sm">{selectedVenue.location}</p>
                          <p className="text-gray-400 text-xs">Capacity: {selectedVenue.capacity} • {venueSections.length > 0 ? `${venueSections.length} sections` : 'General admission'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Title */}
                  <div>
                    <input
                      type="text"
                      name="title"
                      placeholder="Event Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>

                  {/* Event Description */}
                  <div>
                    <textarea
                      name="description"
                      placeholder="Event Description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                      required
                    />
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      className="w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      required
                    />
                  </div>

                  {/* Artists */}
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#CDCDE0]">Artists</label>
                      {formData.artist_lineup.map((artist, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={artist}
                            onChange={(e) =>
                              handleArtistChange(index, e.target.value)
                            }
                            className="flex-1 bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder={`Artist ${index + 1} name`}
                          />
                          {formData.artist_lineup.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArtist(index)}
                              className="px-3 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addArtist}
                        className="flex items-center gap-2 px-4 py-2 bg-[#23232B] text-[#CDCDE0] rounded-md hover:bg-[#2A2A2A] transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Artist
                      </button>
                    </div>
                  </div>

                  {/* Tickets Configuration */}
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#CDCDE0]">
                        Tickets Configuration
                      </label>
                      <p className="text-xs text-gray-400 mb-3">
                        Configure ticket pricing for your event
                      </p>
                      {formData.tickets.map((ticket, index) => {
                        const isGeneralAdmission = !ticket.section_id && venueSections.length === 0;
                        const section = venueSections.find(s => s.name.toLowerCase() === ticket.type.toLowerCase().trim());

                        return (
                          <div
                            key={index}
                            className="bg-[#23232B] rounded-md p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">
                                {isGeneralAdmission ? 'General Admission' : section?.name || ticket.name}
                              </span>
                              {formData.tickets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTicket(index)}
                                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={ticket.name}
                                onChange={(e) =>
                                  handleTicketChange(index, "name", e.target.value)
                                }
                                className="bg-[#1A1A1A] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ticket name"
                                disabled={isGeneralAdmission}
                              />
                              <div>
                                <input
                                  type="number"
                                  value={ticket.price}
                                  onChange={(e) =>
                                    handleTicketChange(index, "price", e.target.value)
                                  }
                                  className={`bg-[#1A1A1A] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${ticket.price <= 0 ? 'border border-red-500' : ''}`}
                                  placeholder="Price"
                                  min="0"
                                />
                                {ticket.price <= 0 && (
                                  <p className="text-xs text-red-400 mt-1">Price must be greater than 0</p>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              Type: {ticket.type}
                              {isGeneralAdmission && (
                                <span> • Quantity determined by venue capacity</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={addTicket}
                        className="flex items-center gap-2 px-4 py-2 bg-[#23232B] text-[#CDCDE0] rounded-md hover:bg-[#2A2A2A] transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Ticket
                      </button>
                    </div>
                  </div>

                  {/* Main Event Image */}
                  <div>
                    <label className="text-sm text-[#CDCDE0] mb-2 block">
                      Main Event Image
                    </label>
                    {formData.mainImagePreview ? (
                      <div className="relative">
                        <img
                          src={formData.mainImagePreview}
                          alt="Main event preview"
                          className="w-full h-32 object-cover rounded-md bg-[#23232B]"
                        />
                        <button
                          type="button"
                          onClick={removeMainImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full h-32 bg-[#23232B] rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center hover:border-primary transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-400">
                            Upload Main Image (Max 1MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Event Images */}
                  <div>
                    <label className="text-sm text-[#CDCDE0] mb-2 block">
                      Additional Images ({formData.additionalImagePreviews.length}/5)
                    </label>
                    {formData.additionalImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {formData.additionalImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Additional preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md bg-[#23232B]"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.additionalImagePreviews.length < 5 && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full h-20 bg-[#23232B] rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center hover:border-primary transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400">
                            Upload Additional Images (Max 1MB each)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={goBackToVenueStep}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Venue
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary text-white rounded-md px-6 py-3 font-semibold hover:bg-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating Event..." : "Create Event"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Create Venue Modal */}
          <CreateVenueModal
            isOpen={showCreateVenueModal}
            onClose={() => setShowCreateVenueModal(false)}
            onVenueCreated={handleVenueCreated}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleCreateEventWizard;