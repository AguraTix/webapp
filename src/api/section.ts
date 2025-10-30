
const API_BASE_URL = `${
  import.meta.env.VITE_API_URL ||
  "https://agura-ticketing-backend.onrender.com"
}/api/venues`;

// Section interfaces based on backend structure
export interface Section {
  section_id?: string;
  name: string;
  description: string;
  venue_id: string;
  parent_section_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSectionData {
  name: string;
  description: string;
  venue_id: string;
  parent_section_id?: string;
}

export interface UpdateSectionData {
  name?: string;
  description?: string;
  venue_id?: string;
  parent_section_id?: string;
}

// API Response interfaces
export interface SectionResponse {
  message: string;
  section: Section;
}

export interface SectionsResponse {
  message: string;
  sections: Section[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

async function sectionApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Create a new section
export async function createSection(
  sectionData: CreateSectionData
): Promise<ApiResponse<SectionResponse>> {
  console.log('Creating section with data:', sectionData);
  return sectionApiRequest<SectionResponse>('', {
    method: 'POST',
    body: JSON.stringify(sectionData),
  });
}

// Get all sections
export async function getAllSections(): Promise<ApiResponse<SectionsResponse>> {
  return sectionApiRequest<SectionsResponse>('');
}

// Get sections by venue
export async function getSectionsByVenue(
  venueId: string
): Promise<ApiResponse<SectionsResponse>> {
  return sectionApiRequest<SectionsResponse>(`/${venueId}`);
}

// Get section by ID
export async function getSectionById(
  sectionId: string
): Promise<ApiResponse<SectionResponse>> {
  return sectionApiRequest<SectionResponse>(`/${sectionId}`);
}

// Update section
export async function updateSection(
  sectionId: string,
  updateData: UpdateSectionData
): Promise<ApiResponse<SectionResponse>> {
  return sectionApiRequest<SectionResponse>(`/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

// Delete section
export async function deleteSection(
  sectionId: string
): Promise<ApiResponse<{ message: string }>> {
  return sectionApiRequest<{ message: string }>(`/${sectionId}`, {
    method: 'DELETE',
  });
}

// Section utility functions
export const sectionUtils = {
  // Get section ID from section object
  getSectionId: (section: Section): string | undefined => {
    return section.section_id;
  },

  // Format section name for display
  formatSectionName: (section: Section): string => {
    return `${section.name} - ${section.description}`;
  },

  // Check if section has parent
  hasParent: (section: Section): boolean => {
    return !!section.parent_section_id;
  },

  // Get section capacity (placeholder - no seat map in database)
  getSectionCapacity: (section: Section): number => {
    // Since there's no seat_map in the database, return 0 or implement alternative logic
    return 0;
  },
};

export default {
  createSection,
  getAllSections,
  getSectionsByVenue,
  getSectionById,
  updateSection,
  deleteSection,
  sectionUtils,
};