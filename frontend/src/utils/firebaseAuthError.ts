import { FirebaseError } from 'firebase/app';

export interface AuthErrorResult {
  title: string;
  message: string;
  code: string;
}

/**
 * Maps Firebase Auth errors to user-friendly messages
 * Industry standard: NEVER show raw Firebase messages to users
 */
export const handleFirebaseAuthError = (
  error: unknown
): AuthErrorResult => {
  if (!(error instanceof FirebaseError)) {
    return {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
      code: 'unknown',
    };
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        code: error.code,
      };

    case 'auth/invalid-credential':
      return {
        title: 'Invalid Credentials',
        message: 'The email or password you entered are incorrect.',
        code: error.code,
      };

    case 'auth/user-not-found':
      return {
        title: 'Account Not Found',
        message: 'No account exists with this email address.',
        code: error.code,
      };

    case 'auth/user-disabled':
      return {
        title: 'Account Disabled',
        message:
          'Your account has been disabled. Please contact support.',
        code: error.code,
      };

    case 'auth/email-already-in-use':
      return {
        title: 'Email Already In Use',
        message:
          'An account with this email already exists. Try logging in.',
        code: error.code,
      };

    case 'auth/operation-not-allowed':
      return {
        title: 'Sign-in Disabled',
        message:
          'This sign-in method is currently disabled. Please try another method.',
        code: error.code,
      };

    case 'auth/weak-password':
      return {
        title: 'Weak Password',
        message:
          'Password must be at least 6 characters long.',
        code: error.code,
      };

    case 'auth/network-request-failed':
      return {
        title: 'Network Error',
        message:
          'Please check your internet connection and try again.',
        code: error.code,
      };

    case 'auth/too-many-requests':
      return {
        title: 'Too Many Attempts',
        message:
          'Too many attempts. Please wait and try again later.',
        code: error.code,
      };

    case 'auth/requires-recent-login':
      return {
        title: 'Reauthentication Required',
        message:
          'Please log in again to continue.',
        code: error.code,
      };

    default:
      return {
        title: 'Authentication Error',
        message:
          'Something went wrong. Please try again.',
        code: error.code,
      };
  }
};
