import React, { useState } from 'react';
import { X } from 'lucide-react';
import EditEventInformationStep from './editSteps/EditEventInformationStep';
import EditEventTicketsStep from './editSteps/EditEventTicketsStep';
import EditEventSeatsStep from './editSteps/EditEventSeatsStep';
import EditEventArtistsStep from './editSteps/EditEventArtistsStep';
import EditEventMenuStep from './editSteps/EditEventMenuStep';
import type { EventData } from './CreateEventWizard';

interface EditEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  initialData?: EventData;
}

const EditEventWizard = ({ isOpen, onClose, eventId, initialData }: EditEventWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>(
    initialData || {
      eventName: 'Baba Experience',
      eventLocation: 'Kigali Convention Center',
      eventDate: '2025-05-10',
      eventTime: '18:00',
      numberOfPeople: '10000',
      tickets: [
        { id: '1', name: 'VIP Ticket', price: '30000', quantity: '100' },
        { id: '2', name: 'Regular Ticket', price: '15000', quantity: '500' }
      ],
      selectedSeatingArrangement: 'standard',
      artists: [
        { id: '1', name: 'Platini', duration: '45 Min' },
        { id: '2', name: 'Bruce Melody', duration: '30 Min' }
      ],
      menuItems: [
        { id: '1', name: 'Burger', price: '2000', description: 'Delicious beef burger with fries', quantity: '40' },
        { id: '2', name: 'Pizza', price: '3000', description: 'Margherita pizza slice', quantity: '25' }
      ]
    }
  );

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    console.log('Event updated:', { eventId, data: eventData });
    // Here you would typically make an API call to update the event
    onClose();
  };

  const updateEventData = (updates: Partial<EventData>) => {
    setEventData(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EditEventInformationStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <EditEventTicketsStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <EditEventSeatsStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <EditEventArtistsStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <EditEventMenuStep
            data={eventData}
            onUpdate={updateEventData}
            onSave={handleSave}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Edit Event';
      case 2: return 'Edit Event';
      case 3: return 'Edit Event';
      case 4: return 'Edit Event';
      case 5: return 'Edit Event';
      default: return 'Edit Event';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'Event Information';
      case 2: return 'Event Tickets';
      case 3: return 'Select Seats Arrangement';
      case 4: return 'Event Artists';
      case 5: return 'Event Menu';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-black rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="ml-9">
            <h2 className="text-2xl font-bold text-pink-500">{getStepTitle()}</h2>
            <p className="text-sm text-[#CDCDE0] mt-1">{getStepSubtitle()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#23232B] text-[#CDCDE0] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 ml-9 mb-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index + 1 === currentStep
                      ? 'bg-pink-500 text-white'
                      : index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  );
};

export default EditEventWizard;