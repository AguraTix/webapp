import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const rows = 6;
const cols = 10;
const initialSeats = Array.from({ length: rows }, (_, row) =>
  Array.from({ length: cols }, (_, col) => ({
    id: `${row}-${col}`,
    selected: row > 1 && col > 1 && row < 5, // some preselected for demo
  }))
);

const SeatSelection = () => {
  const [seats, setSeats] = useState(initialSeats);
  const navigate = useNavigate();

  const toggleSeat = (rowIdx: number, colIdx: number) => {
    setSeats(seats =>
      seats.map((row, r) =>
        row.map((seat, c) =>
          r === rowIdx && c === colIdx
            ? { ...seat, selected: !seat.selected }
            : seat
        )
      )
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#18181B] flex items-center justify-center">
      <div className="bg-[#23232B] rounded-2xl p-8 w-full max-w-5xl min-h-[500px] flex flex-col gap-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[#101010] text-white hover:bg-primary transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-bold text-white">Choose Seats</span>
        </div>
        <div className="flex flex-col md:flex-row gap-8 w-full">
          <div className="flex-1 flex flex-col items-center">
            <div className="grid grid-cols-10 gap-3">
              {seats.map((row, rowIdx) =>
                row.map((seat, colIdx) => (
                  <button
                    key={seat.id}
                    onClick={() => toggleSeat(rowIdx, colIdx)}
                    className={`w-8 h-8 md:w-12 md:h-12 rounded-md flex items-center justify-center transition-all duration-200
                      ${seat.selected ? 'bg-green-500' : 'bg-primary'}
                    `}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="8" width="16" height="8" rx="3" fill="currentColor" />
                      <rect x="7" y="16" width="3" height="4" rx="1.5" fill="currentColor" />
                      <rect x="14" y="16" width="3" height="4" rx="1.5" fill="currentColor" />
                    </svg>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 items-start mt-8 md:mt-0">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block"></span>
              <span className="text-white text-sm">Selected Seats</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary inline-block"></span>
              <span className="text-white text-sm">UnSelected Seats</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection; 