import React from 'react';
import type { EventData } from '../CreateEventWizard';

interface EventArtistsStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EventArtistsStep = ({ data, onUpdate, onNext, onBack }: EventArtistsStepProps) => {
  const handleArtistChange = (index: number, field: string, value: string) => {
    const updatedArtists = [...data.artists];
    updatedArtists[index] = { ...updatedArtists[index], [field]: value };
    onUpdate({ artists: updatedArtists });
  };

  const addArtist = () => {
    const newArtist = {
      id: Date.now().toString(),
      name: 'Platini',
      duration: '10 Min'
    };
    onUpdate({ artists: [...data.artists, newArtist] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Event Artists</h3>
      </div>

      <div className="space-y-6">
        {data.artists.map((artist, index) => (
          <div key={artist.id} className="grid grid-cols-2 gap-6">
            {/* Artist Name */}
            <div>
              <label className="block mb-2 text-sm font-normal text-white">
                Artist Name
              </label>
              <input
                type="text"
                value={artist.name}
                onChange={(e) => handleArtistChange(index, 'name', e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter artist name"
                required
              />
            </div>

            {/* Artist Performance Duration */}
            <div>
              <label className="block mb-2 text-sm font-normal text-white">
                Artist Performance Duration
              </label>
              <input
                type="text"
                value={artist.duration}
                onChange={(e) => handleArtistChange(index, 'duration', e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter duration (e.g., 10 Min)"
                required
              />
            </div>
          </div>
        ))}

        {/* Add Artists Button */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={addArtist}
            className="px-8 py-3 font-semibold text-white transition-colors rounded-3xl bg-pink-500 hover:bg-pink-600"
          >
            Add Artists
          </button>
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

export default EventArtistsStep;