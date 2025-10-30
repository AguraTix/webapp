import React from 'react';
import { Trash2 } from 'lucide-react';
import type { EventData } from '../CreateEventWizard';

interface EditEventArtistsStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EditEventArtistsStep = ({ data, onUpdate, onNext, onBack }: EditEventArtistsStepProps) => {
  const handleArtistChange = (index: number, field: string, value: string) => {
    const updatedArtists = [...data.artists];
    updatedArtists[index] = { ...updatedArtists[index], [field]: value };
    onUpdate({ artists: updatedArtists });
  };

  const addArtist = () => {
    const newArtist = {
      id: Date.now().toString(),
      name: '',
      duration: '15 Min'
    };
    onUpdate({ artists: [...data.artists, newArtist] });
  };

  const removeArtist = (index: number) => {
    const updatedArtists = data.artists.filter((_, i) => i !== index);
    onUpdate({ artists: updatedArtists });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Update Event Artists</h3>
        <p className="text-sm text-gray-400">Modify the artist lineup and performance schedule</p>
      </div>

      <div className="space-y-6">
        {data.artists.map((artist, index) => (
          <div key={artist.id} className="relative">
            <div className="grid grid-cols-2 gap-6">
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
              <div className="relative">
                <label className="block mb-2 text-sm font-normal text-white">
                  Performance Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={artist.duration}
                    onChange={(e) => handleArtistChange(index, 'duration', e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="Enter duration (e.g., 30 Min)"
                    required
                  />
                  {data.artists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArtist(index)}
                      className="px-3 py-3 text-red-400 transition-colors bg-red-900/20 rounded-lg hover:bg-red-900/40"
                      title="Remove artist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
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
            Add Artist
          </button>
        </div>
      </div>

      {/* Performance Schedule Summary */}
      <div className="mt-8 p-4 bg-[#1A1A1A] rounded-lg">
        <h4 className="text-sm font-semibold text-[#CDCDE0] mb-3">Performance Schedule</h4>
        <div className="space-y-2">
          {data.artists.map((artist, index) => (
            <div key={artist.id} className="flex justify-between text-sm text-gray-300">
              <span>{artist.name || `Artist ${index + 1}`}</span>
              <span>{artist.duration}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex justify-between text-sm font-semibold text-white">
            <span>Total Duration:</span>
            <span>
              {data.artists.reduce((total, artist) => {
                const minutes = parseInt(artist.duration.replace(/\D/g, '')) || 0;
                return total + minutes;
              }, 0)} Min
            </span>
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

export default EditEventArtistsStep;