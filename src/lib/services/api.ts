// src/lib/services/api.ts
const API_BASE_URL = 'http://192.168.191.56:4000/api/v1'; // 替换为你的 Rails API 地址

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public errors?: Record<string, string[]>) {
    super(message);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'API request failed',
      response.status,
      data.errors
    );
  }
  
  return data;
}

export const api = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: credentials }),
    });

    return handleResponse<User>(response);
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<User>(response);
  },

  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<void>(response);
  }
};
