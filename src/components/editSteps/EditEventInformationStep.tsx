import React from 'react';
import type { EventData } from '../CreateEventWizard';

interface EditEventInformationStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
}

const EditEventInformationStep = ({ data, onUpdate, onNext }: EditEventInformationStepProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Update Event Information</h3>
        <p className="text-sm text-gray-400">Modify the basic details of your event</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block mb-2 text-sm font-normal text-white">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              value={data.eventName}
              onChange={handleInputChange}
              className="w-[440px] px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter event name"
              required
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block mb-2 text-sm font-normal text-white">
              Event Date
            </label>
            <input
              type="date"
              name="eventDate"
              value={data.eventDate}
              onChange={handleInputChange}
              className="w-[440px] px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              placeholder="Choose Date"
              required
            />
          </div>

          {/* Number of People */}
          <div>
            <label className="block mb-2 text-sm font-normal text-white">
              Number of People to Attend
            </label>
            <input
              type="number"
              name="numberOfPeople"
              value={data.numberOfPeople}
              onChange={handleInputChange}
              className="w-[440px] px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter number of people"
              required
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Event Location */}
          <div>
            <label className="block mb-2 text-sm font-normal text-white">
              Event Location
            </label>
            <input
              type="text"
              name="eventLocation"
              value={data.eventLocation}
              onChange={handleInputChange}
              className="w-[440px] px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter event location"
              required
            />
          </div>

          {/* Event Time */}
          <div>
            <label className="block mb-2 text-sm font-normal text-white">
              Event Time
            </label>
            <input
              type="time"
              name="eventTime"
              value={data.eventTime}
              onChange={handleInputChange}
              className="w-[440px] px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              placeholder="Choose Time"
              required
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
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

export default EditEventInformationStep;