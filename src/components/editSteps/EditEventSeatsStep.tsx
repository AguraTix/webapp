import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { EventData } from "../CreateEventWizard";

interface EditEventSeatsStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EditEventSeatsStep = ({
  data,
  onUpdate,
  onNext,
  onBack,
}: EditEventSeatsStepProps) => {
  const [selectedArrangement, setSelectedArrangement] = useState(
    data.selectedSeatingArrangement
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const layoutOptions = [
    { value: "standard", label: "Standard" },
    { value: "theater", label: "Theater Style" },
    { value: "banquet", label: "Banquet" },
    { value: "conference", label: "Conference" },
  ];

  const handleLayoutSelect = (value: string) => {
    setSelectedArrangement(value);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate seat grid for visualization
  const generateSeatGrid = () => {
    const seats = [];
    const rows = 8;
    const seatsPerRow = 12;

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatNumber = row * seatsPerRow + seat;
        let seatColor = "bg-pink-500"; // Available seats

        // Make some seats different colors for variety
        if (seatNumber % 15 === 0) seatColor = "bg-green-500"; // VIP seats
        if (seatNumber % 20 === 0) seatColor = "bg-gray-500"; // Unavailable seats
        if (seatNumber % 25 === 0) seatColor = "bg-blue-500"; // Reserved seats

        rowSeats.push(
          <div
            key={seatNumber}
            className={`w-6 h-6 ${seatColor} rounded-sm m-0.5 cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => {
              // Handle seat selection logic here
            }}
          />
        );
      }
      seats.push(
        <div key={row} className="flex justify-center">
          {rowSeats}
        </div>
      );
    }
    return seats;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ selectedSeatingArrangement: selectedArrangement });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">
          Update Seats Arrangement
        </h3>
        <p className="text-sm text-gray-400">
          Modify the seating layout and capacity
        </p>
      </div>

      <div className="flex gap-8">
        {/* Left Side - Seat Grid */}
        <div className="flex-1">
          <div className="space-y-1">{generateSeatGrid()}</div>
        </div>

        {/* Center - Stage/Layout Preview */}
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-gray-600 rounded-lg p-8 w-80 h-60 relative">
            {/* Stage representation */}
            <div className="bg-yellow-600 rounded w-full h-8 mb-4 flex items-center justify-center text-xs text-black font-semibold">
              STAGE
            </div>

            {/* Seating sections */}
            <div className="grid grid-cols-4 gap-2 h-32">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="bg-gray-400 rounded-sm"></div>
              ))}
            </div>

            {/* VIP section */}
            <div className="absolute bottom-4 left-4 right-4 bg-yellow-500 rounded h-6 flex items-center justify-center text-xs text-black font-semibold">
              VIP SECTION
            </div>
          </div>
        </div>

        {/* Right Side - Legend & Options */}
        <div className="w-40">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded-sm"></div>
              <span className="text-white text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <span className="text-white text-sm">VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span className="text-white text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
              <span className="text-white text-sm">Sold</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-white mb-2">
                Layout Type
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] rounded text-white text-sm focus:outline-none focus:border-pink-500 border border-transparent hover:border-pink-500 transition-colors flex items-center justify-between"
                >
                  <span>
                    {layoutOptions.find(
                      (option) => option.value === selectedArrangement
                    )?.label || "Select Layout"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-gray-600 rounded shadow-lg z-10">
                    {layoutOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleLayoutSelect(option.value)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-pink-500/20 transition-colors first:rounded-t last:rounded-b ${
                          selectedArrangement === option.value
                            ? "bg-pink-500/30 text-pink-300"
                            : "text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-12 py-3 ml-9 font-semibold text-primary transition-colors bg-white rounded-3xl hover:bg-gray-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-12 py-3 mr-20 font-semibold text-white transition-colors rounded-3xl bg-pink-500 hover:bg-pink-600"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default EditEventSeatsStep;
