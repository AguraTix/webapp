import React, { useState } from "react";
import { X } from "lucide-react";
import EventInformationStep from "./steps/EventInformationStep";
import EventTicketsStep from "./steps/EventTicketsStep";
import EventSeatsStep from "./steps/EventSeatsStep";
import EventArtistsStep from "./steps/EventArtistsStep";
import EventMenuStep from "./steps/EventMenuStep";

interface CreateEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EventData {
  // Event Information
  eventName: string;
  eventLocation: string;
  eventDate: string;
  eventTime: string;
  numberOfPeople: string;

  // Tickets
  tickets: Array<{
    id: string;
    name: string;
    price: string;
    quantity: string;
  }>;

  // Seats
  selectedSeatingArrangement: string;

  // Artists
  artists: Array<{
    id: string;
    name: string;
    duration: string;
  }>;

  // Menu
  menuItems: Array<{
    id: string;
    name: string;
    price: string;
    description: string;
    image?: string;
    quantity: string;
  }>;
}

const CreateEventWizard = ({ isOpen, onClose }: CreateEventWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>({
    eventName: "Baba Experience",
    eventLocation: "Kigali Convention Center",
    eventDate: "",
    eventTime: "",
    numberOfPeople: "10000",
    tickets: [
      { id: "1", name: "Vip Ticket", price: "30000", quantity: "100" },
      { id: "2", name: "Vip Ticket", price: "30000", quantity: "100" },
    ],
    selectedSeatingArrangement: "",
    artists: [
      { id: "1", name: "Platini", duration: "10 Min" },
      { id: "2", name: "Platini", duration: "10 Min" },
    ],
    menuItems: [
      {
        id: "1",
        name: "Burger",
        price: "2000",
        description: "Describe your Food here",
        quantity: "40",
      },
    ],
  });

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

  const handleFinish = () => {
    console.log("Event created:", eventData);
    onClose();
  };

  const updateEventData = (updates: Partial<EventData>) => {
    setEventData((prev) => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventInformationStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <EventTicketsStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <EventSeatsStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <EventArtistsStep
            data={eventData}
            onUpdate={updateEventData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <EventMenuStep
            data={eventData}
            onUpdate={updateEventData}
            onFinish={handleFinish}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Create Event";
      case 2:
        return "Create Event";
      case 3:
        return "Create Event";
      case 4:
        return "Create Event";
      case 5:
        return "Create Event";
      default:
        return "Create Event";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-black rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-pink-500 ml-9">
            {getStepTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#23232B] text-[#CDCDE0] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateEventWizard;
