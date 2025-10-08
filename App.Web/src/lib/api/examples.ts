/**
 * Example usage of the GoGoTime API Client
 * These examples show how to use the type-safe API client in React components
 */

import { apiClient, ApiError, RegisterRequest, LoginRequest } from './apiClient';

/**
 * Example: User Registration
 */
export const registerUserExample = async () => {
  try {
    const registerData: RegisterRequest = {
      email: 'user@example.com',
      username: 'johndoe',
      password: 'securepassword123'
    };

    const result = await apiClient.register(registerData);
    
    if (result.success) {
      console.log('User registered successfully:', result.userID);
      return { success: true, userId: result.userID };
    } else {
      console.error('Registration failed:', result.msg);
      return { success: false, error: result.msg };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message, 'Status:', error.status);
      return { success: false, error: error.message };
    }
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Example: User Login
 */
export const loginUserExample = async () => {
  try {
    const loginData: LoginRequest = {
      email: 'user@example.com',
      password: 'securepassword123'
    };

    const result = await apiClient.login(loginData);
    
    if (result.success && result.token) {
      console.log('Login successful, token stored automatically');
      console.log('User info:', result.user);
      return { success: true, user: result.user, token: result.token };
    } else {
      console.error('Login failed:', result.msg);
      return { success: false, error: result.msg };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message, 'Status:', error.status);
      return { success: false, error: error.message };
    }
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Example: User Logout
 */
export const logoutUserExample = async () => {
  try {
    const result = await apiClient.logout();
    
    if (result.success) {
      console.log('Logout successful, token cleared automatically');
      return { success: true };
    } else {
      console.error('Logout failed:', result.msg);
      return { success: false, error: result.msg };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message, 'Status:', error.status);
      return { success: false, error: error.message };
    }
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Example: React Hook for API calls
 * This is a simple example of how you might use the API client in a React hook
 */
export const useApiExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    makeApiCall,
    // Specific API calls
    register: (data: RegisterRequest) => makeApiCall(() => apiClient.register(data)),
    login: (data: LoginRequest) => makeApiCall(() => apiClient.login(data)),
    logout: () => makeApiCall(() => apiClient.logout()),
  };
};

// Note: Don't forget to import useState in your React components
const useState = (initial: any) => [initial, () => {}]; // Placeholder for this example file
