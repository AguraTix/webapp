import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Music,
  Ticket,
  Camera,
} from "lucide-react";
import {
  updateEvent,
  eventUtils,
  type TicketType,
  type Event,
} from "../api/event";
import { getAllVenues, venueUtils, type Venue } from "../api/venue";
import { imageUtils } from "../api/upload";

interface SimpleEditEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  initialEvent: Event;
  onEventUpdated?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue_id: string;
  artist_lineup: string[];
  tickets: TicketType[];
  mainImageFile: File | null;
  mainImagePreview: string | null;
  additionalImageFiles: File[];
  additionalImagePreviews: string[];
}

const SimpleEditEventWizard: React.FC<SimpleEditEventWizardProps> = ({
  isOpen,
  onClose,
  eventId,
  initialEvent,
  onEventUpdated,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "18:00",
    venue_id: "",
    artist_lineup: [""],
    tickets: [{ type: "Regular", price: 50, quantity: 100 }],
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

  // Initialize form data with existing event data
  useEffect(() => {
    if (initialEvent && isOpen) {
      const eventDate = new Date(initialEvent.date);
      const dateStr = eventDate.toISOString().split("T")[0];
      const timeStr = eventDate.toTimeString().slice(0, 5);

      // Parse artist lineup
      let artists: string[] = [];
      if (typeof initialEvent.artist_lineup === "string") {
        try {
          artists = JSON.parse(initialEvent.artist_lineup);
        } catch {
          artists = initialEvent.artist_lineup
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(initialEvent.artist_lineup)) {
        artists = initialEvent.artist_lineup;
      }

      // Parse tickets
      let tickets: TicketType[] = [];
      if (typeof initialEvent.tickets === "string") {
        try {
          tickets = JSON.parse(initialEvent.tickets);
        } catch {
          tickets = [{ type: "Regular", price: 50, quantity: 100 }];
        }
      } else if (Array.isArray(initialEvent.tickets)) {
        tickets = initialEvent.tickets;
      }

      setFormData({
        title: initialEvent.title || "",
        description: initialEvent.description || "",
        eventDate: dateStr,
        eventTime: timeStr,
        venue_id: initialEvent.venue_id || "",
        artist_lineup: artists.length > 0 ? artists : [""],
        tickets:
          tickets.length > 0
            ? tickets
            : [{ type: "Regular", price: 50, quantity: 100 }],
        mainImageFile: null,
        mainImagePreview: eventUtils.getEventImageUrl(initialEvent),
        additionalImageFiles: [],
        additionalImagePreviews: [],
      });
    }
  }, [initialEvent, isOpen]);

  // Fetch venues
  useEffect(() => {
    if (isOpen) {
      fetchVenues();
    }
  }, [isOpen]);

  const fetchVenues = async () => {
    try {
      setIsLoadingVenues(true);
      const response = await getAllVenues();
      if (response.success && response.data) {
        setVenues(response.data.venues || []);
      } else {
        console.error("Failed to fetch venues:", response.error);
        setVenues([]);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      setVenues([]);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "18:00",
      venue_id: "",
      artist_lineup: [""],
      tickets: [{ type: "Regular", price: 50, quantity: 100 }],
      mainImageFile: null,
      mainImagePreview: null,
      additionalImageFiles: [],
      additionalImagePreviews: [],
    });
    setErrors([]);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Main image upload
  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image first
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

      // Clear any previous image errors
      setErrors((prev) => prev.filter((error) => !error.includes("image")));
    } catch (error) {
      console.error("Error compressing image:", error);
      setErrors(["Failed to process image"]);
    }
  };

  // Additional images upload
  const handleAdditionalImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if total images would exceed 5
    if (formData.additionalImageFiles.length + files.length > 5) {
      setErrors(["Maximum 5 additional images allowed"]);
      return;
    }

    try {
      // Compress all files
      const compressedFiles = await Promise.all(
        files.map((file) => imageUtils.compressImage(file))
      );

      // Validate each compressed file
      for (const file of compressedFiles) {
        const validationError = imageUtils.validateImageFile(file);
        if (validationError) {
          setErrors([validationError]);
          return;
        }
      }

      // Create previews
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

      // Clear any previous image errors
      setErrors((prev) => prev.filter((error) => !error.includes("image")));
    } catch (error) {
      console.error("Error compressing images:", error);
      setErrors(["Failed to process images"]);
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
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

  // Add artist
  const addArtist = () => {
    setFormData((prev) => ({
      ...prev,
      artist_lineup: [...prev.artist_lineup, ""],
    }));
  };

  // Remove artist
  const removeArtist = (index: number) => {
    if (formData.artist_lineup.length > 1) {
      setFormData((prev) => ({
        ...prev,
        artist_lineup: prev.artist_lineup.filter((_, i) => i !== index),
      }));
    }
  };

  // Update artist
  const updateArtist = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      artist_lineup: prev.artist_lineup.map((artist, i) =>
        i === index ? value : artist
      ),
    }));
  };

  // Add ticket type
  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, { type: "", price: 0, quantity: 0 }],
    }));
  };

  // Remove ticket type
  const removeTicketType = (index: number) => {
    if (formData.tickets.length > 1) {
      setFormData((prev) => ({
        ...prev,
        tickets: prev.tickets.filter((_, i) => i !== index),
      }));
    }
  };

  // Update ticket type
  const updateTicketType = (
    index: number,
    field: keyof TicketType,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
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
    }

    if (!formData.venue_id) {
      newErrors.push("Please select a venue");
    }

    // Validate artists
    const validArtists = formData.artist_lineup.filter((artist) =>
      artist.trim()
    );
    if (validArtists.length === 0) {
      newErrors.push("At least one artist is required");
    }

    // Validate tickets
    const validTickets = formData.tickets.filter(
      (ticket) => ticket.type.trim() && ticket.price > 0 && ticket.quantity > 0
    );
    if (validTickets.length === 0) {
      newErrors.push("At least one valid ticket type is required");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // Prepare event data
      const eventData = eventUtils.formatEventDataForAPI({
        eventName: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        venue_id: formData.venue_id,
        artists: formData.artist_lineup.filter((artist) => artist.trim()),
        tickets: formData.tickets.filter(
          (ticket) =>
            ticket.type.trim() && ticket.price > 0 && ticket.quantity > 0
        ),
        event_image: formData.mainImageFile,
        event_images: formData.additionalImageFiles,
      });

      console.log("Updating event with data:", eventData);
      console.log("Event ID:", eventId);

      const response = await updateEvent(eventId, {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        venue_id: eventData.venue_id,
        artist_lineup: formData.artist_lineup.filter(artist => artist.trim()),
        event_image: formData.mainImageFile,
        event_images: formData.additionalImageFiles,
      });

      if (response.success) {
        console.log("Event updated successfully:", response.data);
        setIsSuccess(true);

        // Auto-close after 2 seconds
        setTimeout(() => {
          onEventUpdated?.();
          onClose();
          resetForm();
        }, 2000);
      } else {
        setErrors([response.error || "Failed to update event"]);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setErrors([
        error instanceof Error ? error.message : "Failed to update event",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Edit Event</h2>
              <p className="text-sm text-gray-400">
                Update event information and details
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="m-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-medium">
                Event updated successfully!
              </span>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="m-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-red-400 font-medium">
                Please fix the following errors:
              </span>
            </div>
            <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Event Information
            </h3>

            {/* Event Title */}
            <div>
              <label className="text-sm text-[#CDCDE0] mb-2 block">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="text-sm text-[#CDCDE0] mb-2 block">
                Event Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
                placeholder="Describe your event..."
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#CDCDE0] mb-2 block">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#CDCDE0] mb-2 block">
                  Event Time *
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventTime: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Venue Selection */}
            <div>
              <label className="text-sm text-[#CDCDE0] mb-2 block">
                Venue *
              </label>
              {isLoadingVenues ? (
                <div className="w-full px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-gray-400">
                  Loading venues...
                </div>
              ) : (
                <select
                  value={formData.venue_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      venue_id: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option
                      key={venueUtils.getVenueId(venue)}
                      value={venueUtils.getVenueId(venue)}
                    >
                      {venue.name} - {venue.location}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Artists Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Artists & Performers
            </h3>

            {formData.artist_lineup.map((artist, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => updateArtist(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                  placeholder={`Artist ${index + 1} name`}
                />
                {formData.artist_lineup.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArtist(index)}
                    className="p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addArtist}
              className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Artist
            </button>
          </div>

          {/* Tickets Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Ticket Types
            </h3>

            {formData.tickets.map((ticket, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[#101010] rounded-lg border border-gray-800"
              >
                <input
                  type="text"
                  value={ticket.type}
                  onChange={(e) =>
                    updateTicketType(index, "type", e.target.value)
                  }
                  className="px-3 py-2 bg-[#1A1A1A] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                  placeholder="Ticket type"
                />
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) =>
                    updateTicketType(index, "price", Number(e.target.value))
                  }
                  className="px-3 py-2 bg-[#1A1A1A] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                  placeholder="Price"
                  min="0"
                />
                <input
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) =>
                    updateTicketType(index, "quantity", Number(e.target.value))
                  }
                  className="px-3 py-2 bg-[#1A1A1A] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                  placeholder="Quantity"
                  min="0"
                />
                {formData.tickets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addTicketType}
              className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Ticket Type
            </button>
          </div>

          {/* Images Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Event Images
            </h3>

            {/* Main Event Image */}
            <div>
              <label className="text-sm text-[#CDCDE0] mb-2 block">
                Main Event Image
              </label>
              {formData.mainImagePreview ? (
                <div className="relative">
                  <img
                    src={formData.mainImagePreview}
                    alt="Main event"
                    className="w-full h-48 object-cover rounded-lg border border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        mainImageFile: null,
                        mainImagePreview: null,
                      }))
                    }
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                    id="main-image-upload"
                  />
                  <label
                    htmlFor="main-image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">
                        Upload Main Image (Max 1MB)
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label className="text-sm text-[#CDCDE0] mb-2 block">
                Additional Images ({formData.additionalImagePreviews.length}/5)
              </label>

              {/* Image Previews */}
              {formData.additionalImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {formData.additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              {formData.additionalImagePreviews.length < 5 && (
                <div className="border-2 border-dashed border-gray-800 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                    id="additional-images-upload"
                  />
                  <label
                    htmlFor="additional-images-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">
                        Upload Additional Images (Max 1MB each)
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Update Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleEditEventWizard;
