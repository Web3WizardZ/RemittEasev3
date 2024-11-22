// Session types
export interface UserSession {
    walletAddress: string;
    name: string;
    email: string;
    currency: string;
  }
  
  export interface SessionResponse {
    success: boolean;
    session?: UserSession;
    error?: string;
  }
  
  export async function getSession(): Promise<SessionResponse> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch session'
      };
    }
  }