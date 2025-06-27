export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Hashed password
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
}

// Database document interface (without password for client-side)
export interface UserDocument extends Omit<User, 'password'> {
  fullName: string; // Computed field
}

// User profile for public display
export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: Date;
  preferences: Pick<UserPreferences, 'defaultView' | 'theme'>;
}
