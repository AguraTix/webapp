import React from 'react';
import SimpleEditEventWizard from './SimpleEditEventWizard';
import type { Event } from '../api/event';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  initialEvent: Event;
  onEventUpdated?: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ 
  isOpen, 
  onClose, 
  eventId, 
  initialEvent,
  onEventUpdated 
}) => {
  if (!eventId || !initialEvent) {
    return null;
  }

  return (
    <SimpleEditEventWizard 
      isOpen={isOpen} 
      onClose={onClose} 
      eventId={eventId}
      initialEvent={initialEvent}
      onEventUpdated={onEventUpdated}
    />
  );
};

export default EditEventModal;