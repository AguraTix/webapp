// This file is deprecated - use CreateEventWizard instead
import CreateEventWizard from './CreateEventWizard';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
    return <CreateEventWizard isOpen={isOpen} onClose={onClose} />;
};

export default CreateEventModal; 