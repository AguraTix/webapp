import React, { useState } from 'react';
import type { EventData } from '../CreateEventWizard';

interface EventSeatsStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EventSeatsStep = ({ data, onUpdate, onNext, onBack }: EventSeatsStepProps) => {
  const [selectedArrangement, setSelectedArrangement] = useState(data.selectedSeatingArrangement);

  // Generate seat grid for visualization
  const generateSeatGrid = () => {
    const seats = [];
    const rows = 8;
    const seatsPerRow = 12;
    
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatNumber = row * seatsPerRow + seat;
        let seatColor = 'bg-pink-500'; // Available seats
        
        // Make some seats different colors for variety
        if (seatNumber % 15 === 0) seatColor = 'bg-green-500'; // VIP seats
        if (seatNumber % 20 === 0) seatColor = 'bg-gray-500'; // Unavailable seats
        
        rowSeats.push(
          <div
            key={seatNumber}
            className={`w-6 h-6 ${seatColor} rounded-sm m-0.5 cursor-pointer hover:opacity-80 transition-opacity`}
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
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Select Seats Arrangement</h3>
      </div>

      <div className="flex gap-8">
        {/* Left Side - Seat Grid */}
        <div className="flex-1">
          <div className="space-y-1">
            {generateSeatGrid()}
          </div>
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

        {/* Right Side - Legend */}
        <div className="w-32">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded-sm"></div>
              <span className="text-white text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <span className="text-white text-sm">VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
              <span className="text-white text-sm">Unavailable</span>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-[#CDCDE0] text-sm">None</p>
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

export default EventSeatsStep;