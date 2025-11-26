const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://agurabackend.onrender.com"
}/api`;


export interface Admin{
    user_id:string,
    email:string,
    name:string,
    phone_number:string,
    role:string,
    createdAt:string,
    updated_at:string,
    expires_at:string,
    new_password:string
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AdminResponse{
    message:string,
    admins:Admin[]
}

const getAuth = (): string | null => {
    const token = localStorage.getItem("token");
    return token;
  };

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = getAuth();
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


export async function getAdmins(): Promise<ApiResponse<AdminResponse>> {
    const endpoint = "/users/superadmin/my-admins";
    return apiRequest<AdminResponse>(endpoint);

  }


  export async function createAdmin(admin: Admin): Promise<ApiResponse<AdminResponse>> {
    const endpoint = "/users/superadmin/create-admin";
    return apiRequest<AdminResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(admin),
    });
  }

  export async function getAllAdmins(): Promise<ApiResponse<AdminResponse>> {
    const endpoint = "/users/superadmin/all-admins";
    return apiRequest<AdminResponse>(endpoint);
  }

  export async function UpdateAdmin(id:string,admin:Admin):Promise<ApiResponse<AdminResponse>>{
    const endpoint = `/users/superadmin/admins/${id}`;
    return apiRequest<AdminResponse>(endpoint, {
      method: "PUT",
      body:JSON.stringify(admin)
    });
  }