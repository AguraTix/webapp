import React from 'react';
import type { EventData } from '../CreateEventWizard';

interface EventTicketsStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EventTicketsStep = ({ data, onUpdate, onNext, onBack }: EventTicketsStepProps) => {
  const handleTicketChange = (index: number, field: string, value: string) => {
    const updatedTickets = [...data.tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    onUpdate({ tickets: updatedTickets });
  };

  const addTicketSlot = () => {
    const newTicket = {
      id: Date.now().toString(),
      name: 'Vip Ticket',
      price: '30000',
      quantity: '100'
    };
    onUpdate({ tickets: [...data.tickets, newTicket] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Event Tickets</h3>
      </div>

      <div className="space-y-6">
        {data.tickets.map((ticket, index) => (
          <div key={ticket.id} className="grid grid-cols-3 gap-6">
            {/* Ticket Name */}
            <div>
              <label className="block mb-2 text-sm font-normal text-white">
                Ticket Name
              </label>
              <input
                type="text"
                value={ticket.name}
                onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter ticket name"
                required
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block mb-2 text-sm font-normal text-white">
                Ticket Price
              </label>
              <input
                type="text"
                value={ticket.price}
                onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter price"
                required
              />
            </div>

            {/* Ticket Numbers */}
            <div>
              <label className="block mb-2 text-sm font-normal text-white">
                Ticket Numbers
              </label>
              <input
                type="number"
                value={ticket.quantity}
                onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>
        ))}

        {/* Add Ticket Slot Button */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={addTicketSlot}
            className="px-8 py-3 font-semibold text-white transition-colors rounded-3xl bg-pink-500 hover:bg-pink-600"
          >
            Add Ticket Slot
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

export default EventTicketsStep;