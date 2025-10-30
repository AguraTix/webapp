import React, { useState, useEffect } from 'react';
import { X, Grid, Building, FileText } from 'lucide-react';
import { createSection, getSectionsByVenue } from '../api/section';
import { getAllVenues } from '../api/venue';
import CustomDropdown from './ui/CustomDropdown';

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionCreated: (section: any) => void;
  preselectedVenueId?: string;
}

const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
  isOpen,
  onClose,
  onSectionCreated,
  preselectedVenueId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue_id: preselectedVenueId || '',
    parent_section_id: '',
  });
  const [venues, setVenues] = useState<any[]>([]);
  const [parentSections, setParentSections] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Fetch venues on component mount
  useEffect(() => {
    if (isOpen) {
      fetchVenues();
    }
  }, [isOpen]);

  // Fetch parent sections when venue changes
  useEffect(() => {
    if (formData.venue_id) {
      fetchParentSections(formData.venue_id);
    } else {
      setParentSections([]);
    }
  }, [formData.venue_id]);

  const fetchVenues = async () => {
    try {
      setIsLoadingVenues(true);
      const response = await getAllVenues();
      if (response.success && response.data) {
        const venuesList = Array.isArray(response.data) ? response.data : response.data.venues || [];
        setVenues(venuesList);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  const fetchParentSections = async (venueId: string) => {
    try {
      setIsLoadingSections(true);
      const response = await getSectionsByVenue(venueId);
      if (response.success && response.data) {
        const sectionsList = Array.isArray(response.data) ? response.data : response.data.sections || [];
        setParentSections(sectionsList);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setParentSections([]);
    } finally {
      setIsLoadingSections(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Section name is required');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    if (!formData.venue_id) {
      newErrors.push('Venue selection is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors([]);

      const sectionData = {
        ...formData,
        parent_section_id: formData.parent_section_id || undefined,
      };

      const response = await createSection(sectionData);

      if (response.success && response.data) {
        console.log('Section created successfully:', response.data);
        setIsSuccess(true);
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onSectionCreated(response.data.section);
          resetForm();
          onClose();
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to create section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to create section']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      venue_id: preselectedVenueId || '',
      parent_section_id: '',
    });
    setErrors([]);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const venueOptions = venues.map(venue => venue.name);
  const parentSectionOptions = ['None', ...parentSections.map(section => section.name)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Grid className="w-6 h-6 text-primary" />
            Create New Section
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {isSuccess && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-semibold text-sm">Section Created Successfully!</p>
                  <p className="text-green-300 text-xs mt-1">Closing in 2 seconds...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && !isSuccess && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <ul className="text-red-400 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Section Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="Enter section name (e.g., VIP, General, Balcony)"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="Describe this section"
              rows={3}
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Venue Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Venue *
              {preselectedVenueId && (
                <span className="ml-2 text-xs text-primary">(Pre-selected)</span>
              )}
            </label>
            {isLoadingVenues ? (
              <div className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-gray-500">
                Loading venues...
              </div>
            ) : preselectedVenueId ? (
              <div className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <span>{venues.find(v => v.venue_id === formData.venue_id)?.name || 'Selected Venue'}</span>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                    Pre-selected
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  This venue was selected in the previous step
                </p>
              </div>
            ) : (
              <CustomDropdown
                options={venueOptions}
                value={venues.find(v => v.venue_id === formData.venue_id)?.name || ''}
                onChange={(value) => {
                  const selectedVenue = venues.find(v => v.name === value);
                  setFormData({ ...formData, venue_id: selectedVenue?.venue_id || '' });
                }}
                placeholder="Select a venue"
                disabled={isSubmitting || isSuccess}
              />
            )}
          </div>

          {/* Parent Section (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Parent Section (Optional)
            </label>
            {isLoadingSections ? (
              <div className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-gray-500">
                Loading sections...
              </div>
            ) : (
              <CustomDropdown
                options={parentSectionOptions}
                value={parentSections.find(s => s.section_id === formData.parent_section_id)?.name || 'None'}
                onChange={(value) => {
                  if (value === 'None') {
                    setFormData({ ...formData, parent_section_id: '' });
                  } else {
                    const selectedSection = parentSections.find(s => s.name === value);
                    setFormData({ ...formData, parent_section_id: selectedSection?.section_id || '' });
                  }
                }}
                placeholder="Select parent section (optional)"
                disabled={isSubmitting || isSuccess || !formData.venue_id}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSectionModal;