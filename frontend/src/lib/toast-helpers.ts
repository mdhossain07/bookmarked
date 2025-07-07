import { toast } from "@/hooks/use-toast";

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    variant: "success",
    title,
    description,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    variant: "destructive",
    title,
    description,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    variant: "default",
    title,
    description,
  });
};

// Specific toast messages for authentication
export const authToasts = {
  loginSuccess: () =>
    showSuccessToast("Welcome back!", "You have been successfully logged in."),

  loginError: (message?: string) =>
    showErrorToast(
      "Login failed",
      message || "Please check your credentials and try again."
    ),

  registerSuccess: () =>
    showSuccessToast(
      "Account created!",
      "Welcome to Bookmarked. You can now start tracking your media."
    ),

  registerError: (message?: string) =>
    showErrorToast(
      "Registration failed",
      message || "Please check your information and try again."
    ),

  logoutSuccess: () =>
    showInfoToast("Logged out", "You have been successfully logged out."),

  googleLoginSuccess: () =>
    showSuccessToast(
      "Welcome!",
      "You have been successfully logged in with Google."
    ),

  googleLoginError: (message?: string) =>
    showErrorToast(
      "Google login failed",
      message ||
        "There was an issue with Google authentication. Please try again."
    ),
};
