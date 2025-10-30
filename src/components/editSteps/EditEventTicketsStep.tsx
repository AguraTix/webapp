import React from 'react';
import { Trash2 } from 'lucide-react';
import type { EventData } from '../CreateEventWizard';

interface EditEventTicketsStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EditEventTicketsStep = ({ data, onUpdate, onNext, onBack }: EditEventTicketsStepProps) => {
  const handleTicketChange = (index: number, field: string, value: string) => {
    const updatedTickets = [...data.tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    onUpdate({ tickets: updatedTickets });
  };

  const addTicketSlot = () => {
    const newTicket = {
      id: Date.now().toString(),
      name: 'New Ticket',
      price: '0',
      quantity: '0'
    };
    onUpdate({ tickets: [...data.tickets, newTicket] });
  };

  const removeTicket = (index: number) => {
    const updatedTickets = data.tickets.filter((_, i) => i !== index);
    onUpdate({ tickets: updatedTickets });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Update Event Tickets</h3>
        <p className="text-sm text-gray-400">Modify ticket types, pricing, and availability</p>
      </div>

      <div className="space-y-6">
        {data.tickets.map((ticket, index) => (
          <div key={ticket.id} className="relative">
            <div className="grid grid-cols-3 gap-6">
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
                  Ticket Price (RWF)
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
              <div className="relative">
                <label className="block mb-2 text-sm font-normal text-white">
                  Available Tickets
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="Enter quantity"
                    required
                  />
                  {data.tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className="px-3 py-3 text-red-400 transition-colors bg-red-900/20 rounded-lg hover:bg-red-900/40"
                      title="Remove ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
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
            Add Ticket Type
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

export default EditEventTicketsStep;