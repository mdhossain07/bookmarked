# Bookmarked - Project Requirements Document (PRD)

**Note: This project is built with TypeScript throughout the entire stack for type safety and better developer experience.**

## Table of Contents

1. [Executive Summary & Product Vision](#executive-summary--product-vision)
2. [User Research & Personas](#user-research--personas)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Database Design](#database-design)
6. [API Specification](#api-specification)
7. [User Interface Design](#user-interface-design)
8. [Technical Implementation Plan](#technical-implementation-plan)
9. [Project Roadmap & Milestones](#project-roadmap--milestones)
10. [Future Enhancements & Stretch Goals](#future-enhancements--stretch-goals)

---

## Executive Summary & Product Vision

### Problem Statement

Media enthusiasts struggle to maintain organized records of books and movies they've consumed, want to consume, or are currently experiencing. Existing solutions are either too complex, lack personalization, or don't provide a unified experience for multiple media types.

### Solution Overview

Bookmarked is a personal media tracking web application that provides a clean, intuitive interface for cataloging books and movies. Users can rate, review, and organize their media consumption with a focus on simplicity and visual appeal.

### Target Audience

- **Primary**: Media enthusiasts aged 25-45 who actively consume books and movies
- **Secondary**: Students and professionals seeking to track educational/professional development content
- **Tertiary**: Casual consumers looking for simple organization tools

### Market Positioning

Positioned as a minimalist alternative to complex platforms like Goodreads or IMDb, focusing on personal organization rather than social features.

### Core Value Proposition

- **Simplicity**: Clean, distraction-free interface
- **Unified Experience**: Single platform for books and movies
- **Personal Focus**: Private tracking without social pressure
- **Visual Appeal**: Emphasis on cover art and visual organization

### Success Metrics

- User retention rate > 70% after 30 days
- Average session duration > 5 minutes
- Media items added per active user > 10/month
- User satisfaction score > 4.2/5

---

## User Research & Personas

### Persona 1: Sarah - The Avid Reader

**Demographics**: 32, Marketing Manager, Urban Professional
**Goals**:

- Track reading progress and maintain reading goals
- Discover patterns in reading preferences
- Remember thoughts about books for future reference

**Pain Points**:

- Forgets details about books read months ago
- Struggles to remember which books friends recommended
- Wants to track reading statistics without complexity

**User Journey**: Logs in weekly to update currently reading books, adds ratings immediately after finishing, browses collection when choosing next read.

### Persona 2: Mike - The Movie Buff

**Demographics**: 28, Software Developer, Suburban
**Goals**:

- Maintain a watchlist for movies to see
- Rate and review movies for personal reference
- Track viewing history across different platforms

**Pain Points**:

- Forgets movies he wanted to watch
- Can't remember if he's already seen a movie
- Wants simple rating system without lengthy reviews

**User Journey**: Adds movies to watchlist throughout the week, updates status after viewing, occasionally browses past ratings when recommending to friends.

### Persona 3: Emma - The Balanced Consumer

**Demographics**: 35, Teacher, Suburban
**Goals**:

- Track both books and movies in one place
- Maintain lists for different moods/genres
- Simple organization without overwhelming features

**Pain Points**:

- Uses multiple apps for different media types
- Wants visual organization but not social features
- Limited time for complex categorization

**User Journey**: Uses app during commute to update status, adds items when recommended by colleagues, reviews collection monthly for next choices.

---

## Functional Requirements

### Core Features

#### Media Management (Books & Movies)

**User Story**: As a user, I want to add books and movies to my collection so that I can track my media consumption.

**Acceptance Criteria**:

- Users can add new media items with required fields
- Users can edit existing media items
- Users can delete media items with confirmation
- Users can upload or link cover images
- System validates all input data using Zod schemas

**Required Data Fields**:

- **Title** (required, string, max 200 chars)
- **Author/Director** (required, string, max 100 chars)
- **Cover URL** (optional, valid URL format)
- **Genre(s)** (required, array of predefined genres)
- **Status** (required, enum: "Want to Read/Watch", "Currently Reading/Watching", "Completed", "Abandoned")
- **Rating** (optional, integer 1-5 scale)
- **Review** (optional, text, max 1000 chars)
- **Date Completed** (optional, date format)
- **Custom Tags** (optional, array of strings)
- **Date Added** (auto-generated, timestamp)
- **Last Modified** (auto-generated, timestamp)

#### Search and Filtering

**User Story**: As a user, I want to search and filter my media collection so that I can quickly find specific items or browse by criteria.

**Acceptance Criteria**:

- Full-text search across title, author/director, and tags
- Filter by status, genre, rating, and date ranges
- Combine multiple filters
- Sort results by date added, rating, title, or completion date
- Search results update in real-time

#### User Authentication

**User Story**: As a user, I want to create an account and log in securely so that my data is private and persistent.

**Acceptance Criteria**:

- User registration with email and password
- Email validation required for account activation
- Secure login with session management
- Password reset functionality
- Account deletion option
- Session timeout after inactivity

### Advanced Features

#### Dashboard and Statistics

**User Story**: As a user, I want to see an overview of my media consumption so that I can understand my habits and progress.

**Acceptance Criteria**:

- Display total counts by media type and status
- Show recently added and recently completed items
- Monthly/yearly consumption statistics
- Average ratings by genre
- Reading/watching streaks and goals

#### Data Import/Export

**User Story**: As a user, I want to import existing data and export my collection so that I can migrate from other platforms and backup my data.

**Acceptance Criteria**:

- CSV import with field mapping
- JSON export of complete user data
- Bulk operations for imported data
- Data validation during import using Zod schemas
- Error reporting for failed imports

---

## Non-Functional Requirements

### Performance Requirements

- **Page Load Time**: Initial page load < 2 seconds on 3G connection
- **API Response Time**: 95% of API calls respond within 500ms
- **Database Queries**: Complex search queries execute within 200ms
- **Image Loading**: Cover images load progressively with placeholders
- **Concurrent Users**: Support 1000+ concurrent users without degradation

### Responsive Design Requirements

- **Mobile-First Approach**: Design starts with mobile (320px) and scales up
- **Breakpoints**:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px - 1439px
  - Large Desktop: 1440px+
- **Touch Targets**: Minimum 44px for interactive elements on mobile
- **Viewport Optimization**: Proper meta viewport configuration

### Security Requirements

- **Authentication**: JWT tokens with 24-hour expiration stored in HTTP-only cookies
- **Authorization**: Role-based access control (user/admin)
- **Data Sanitization**: All user inputs validated with Zod schemas
- **HTTPS**: All communications encrypted in production
- **Password Security**: Bcrypt hashing with salt rounds ≥ 12
- **CORS**: Properly configured cross-origin resource sharing
- **Session Management**: Automatic token refresh with secure cookie handling

### Accessibility Requirements

- **WCAG 2.1 AA Compliance**: Meet Level AA standards
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Clear visual focus states
- **Alternative Text**: Descriptive alt text for all images

### Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **TypeScript**: ES2020+ features with strict type checking
- **CSS**: Modern CSS with fallbacks for older browsers

---

## Database Design

### MongoDB Collections

#### Users Collection

```typescript
interface User {
  _id: ObjectId;
  email: string; // unique, required
  password: string; // hashed, required
  firstName: string; // required
  lastName: string; // required
  createdAt: Date; // auto-generated
  updatedAt: Date; // auto-generated
  isActive: boolean; // default: true
  emailVerified: boolean; // default: false
  lastLogin?: Date;
  preferences: {
    defaultView: "grid" | "list"; // default: 'grid'
    itemsPerPage: number; // default: 20
    theme: "light" | "dark"; // default: 'light'
  };
}
```

#### Media Collection

```typescript
interface Media {
  _id: ObjectId;
  userId: ObjectId; // reference to Users collection
  type: "book" | "movie"; // required
  title: string; // required, max 200 chars
  author?: string; // for books, max 100 chars
  director?: string; // for movies, max 100 chars
  coverUrl?: string; // optional, valid URL
  genres: string[]; // array of predefined genres
  status: "want" | "current" | "completed" | "abandoned";
  rating?: number; // 1-5, optional
  review?: string; // max 1000 chars, optional
  dateCompleted?: Date; // optional
  customTags: string[]; // user-defined tags
  createdAt: Date; // auto-generated
  updatedAt: Date; // auto-generated
  isbn?: string; // for books, optional
  imdbId?: string; // for movies, optional
  pageCount?: number; // for books, optional
  runtime?: number; // for movies in minutes, optional
  releaseYear?: number; // optional
}
```

#### Genres Collection (Reference Data)

```typescript
interface Genre {
  _id: ObjectId;
  name: string; // unique, required
  type: "book" | "movie" | "both";
  isActive: boolean; // default: true
}
```

### Indexing Strategy

```typescript
// Users Collection Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Media Collection Indexes
db.media.createIndex({ userId: 1, createdAt: -1 });
db.media.createIndex({ userId: 1, type: 1, status: 1 });
db.media.createIndex({
  userId: 1,
  title: "text",
  author: "text",
  director: "text",
});
db.media.createIndex({ userId: 1, genres: 1 });
db.media.createIndex({ userId: 1, customTags: 1 });
db.media.createIndex({ userId: 1, rating: 1 });
db.media.createIndex({ userId: 1, dateCompleted: -1 });

// Genres Collection Indexes
db.genres.createIndex({ name: 1, type: 1 }, { unique: true });
```

### Sample Data Structure

```typescript
// Sample User
const sampleUser: User = {
  _id: new ObjectId("..."),
  email: "sarah@example.com",
  firstName: "Sarah",
  lastName: "Johnson",
  preferences: {
    defaultView: "grid",
    itemsPerPage: 20,
    theme: "light",
  },
};

// Sample Book
const sampleBook: Media = {
  _id: new ObjectId("..."),
  userId: new ObjectId("..."),
  type: "book",
  title: "The Seven Husbands of Evelyn Hugo",
  author: "Taylor Jenkins Reid",
  coverUrl: "https://example.com/cover.jpg",
  genres: ["Fiction", "Romance", "Historical Fiction"],
  status: "completed",
  rating: 5,
  review: "Absolutely captivating story with complex characters...",
  dateCompleted: new Date("2024-01-15"),
  customTags: ["book-club", "favorites"],
  pageCount: 400,
  releaseYear: 2017,
};

// Sample Movie
const sampleMovie: Media = {
  _id: new ObjectId("..."),
  userId: new ObjectId("..."),
  type: "movie",
  title: "Dune",
  director: "Denis Villeneuve",
  coverUrl: "https://example.com/dune-poster.jpg",
  genres: ["Science Fiction", "Adventure"],
  status: "completed",
  rating: 4,
  review: "Visually stunning adaptation with excellent cinematography...",
  dateCompleted: new Date("2024-01-20"),
  customTags: ["sci-fi", "epic"],
  runtime: 155,
  releaseYear: 2021,
};
```

---

## API Specification

### Base Configuration

- **Base URL**: `https://api.bookmarked.app/v1`
- **Authentication**: JWT tokens in HTTP-only cookies with automatic refresh
- **Content-Type**: `application/json`
- **Validation**: Zod schemas for all request/response validation
- **Type Safety**: Full TypeScript integration with shared types

### Zod Validation Schemas

#### Authentication Schemas

```typescript
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
```

#### Media Schemas

```typescript
export const MediaSchema = z.object({
  type: z.enum(["book", "movie"]),
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().max(100).optional(),
  director: z.string().max(100).optional(),
  coverUrl: z.string().url("Invalid URL format").optional(),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  status: z.enum(["want", "current", "completed", "abandoned"]),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().max(1000).optional(),
  dateCompleted: z.string().datetime().optional(),
  customTags: z.array(z.string()).default([]),
  isbn: z.string().optional(),
  imdbId: z.string().optional(),
  pageCount: z.number().int().positive().optional(),
  runtime: z.number().int().positive().optional(),
  releaseYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 5)
    .optional(),
});

export const UpdateMediaSchema = MediaSchema.partial().omit({ type: true });

export type CreateMediaRequest = z.infer<typeof MediaSchema>;
export type UpdateMediaRequest = z.infer<typeof UpdateMediaSchema>;
```

### Authentication Endpoints

#### POST /auth/register

Register a new user account with Zod validation.

**Request Body**:

```typescript
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created)**:

```typescript
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "64a7b8c9d1e2f3a4b5c6d7e8",
    "email": "user@example.com"
  }
}
```

#### POST /auth/login

Authenticate user and return JWT token.

**Request Body**:

```typescript
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:

```typescript
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "preferences": {
        "defaultView": "grid",
        "itemsPerPage": 20,
        "theme": "light"
      }
    }
  }
}
```

#### POST /auth/logout

Invalidate current session token.

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:

```typescript
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Media Endpoints

#### GET /media

Retrieve user's media collection with filtering and pagination.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `type`: "book" | "movie" (optional)
- `status`: "want" | "current" | "completed" | "abandoned" (optional)
- `genre`: string (optional)
- `rating`: 1-5 (optional)
- `search`: string (optional, searches title/author/director)
- `tags`: comma-separated string (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `sort`: "title" | "createdAt" | "updatedAt" | "rating" | "dateCompleted" (default: "createdAt")
- `order`: "asc" | "desc" (default: "desc")

**Response (200 OK)**:

```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "64a7b8c9d1e2f3a4b5c6d7e8",
        "type": "book",
        "title": "The Seven Husbands of Evelyn Hugo",
        "author": "Taylor Jenkins Reid",
        "coverUrl": "https://example.com/cover.jpg",
        "genres": ["Fiction", "Romance"],
        "status": "completed",
        "rating": 5,
        "review": "Absolutely captivating...",
        "dateCompleted": "2024-01-15T00:00:00.000Z",
        "customTags": ["book-club", "favorites"],
        "createdAt": "2024-01-10T10:30:00.000Z",
        "updatedAt": "2024-01-15T15:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 87,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### POST /media

Add a new media item to user's collection with Zod validation.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```typescript
{
  "type": "book",
  "title": "Dune",
  "author": "Frank Herbert",
  "coverUrl": "https://example.com/dune-cover.jpg",
  "genres": ["Science Fiction", "Adventure"],
  "status": "want",
  "customTags": ["sci-fi", "classic"]
}
```

**Response (201 Created)**:

```typescript
{
  "success": true,
  "message": "Media item added successfully",
  "data": {
    "id": "64a7b8c9d1e2f3a4b5c6d7e9",
    "type": "book",
    "title": "Dune",
    "author": "Frank Herbert",
    "coverUrl": "https://example.com/dune-cover.jpg",
    "genres": ["Science Fiction", "Adventure"],
    "status": "want",
    "customTags": ["sci-fi", "classic"],
    "createdAt": "2024-01-20T14:30:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z"
  }
}
```

### Error Responses

All endpoints return consistent error responses with Zod validation details:

**400 Bad Request (Validation Error)**:

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

**401 Unauthorized**:

```typescript
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**404 Not Found**:

```typescript
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

## User Interface Design

### Design System

#### Color Palette & Theme System

**Light Theme**:

- **Primary**: #2563EB (Blue 600) - Main brand color for CTAs and highlights
- **Primary Light**: #DBEAFE (Blue 100) - Backgrounds and subtle accents
- **Secondary**: #64748B (Slate 500) - Secondary text and icons
- **Success**: #10B981 (Emerald 500) - Success states and completed items
- **Warning**: #F59E0B (Amber 500) - Warning states and in-progress items
- **Error**: #EF4444 (Red 500) - Error states and destructive actions
- **Background**: #FFFFFF (White) - Main background
- **Surface**: #F8FAFC (Slate 50) - Card backgrounds and sections
- **Text Primary**: #0F172A (Slate 900) - Primary text
- **Text Secondary**: #64748B (Slate 500) - Secondary text
- **Border**: #E2E8F0 (Slate 200) - Borders and dividers

**Dark Theme**:

- **Primary**: #3B82F6 (Blue 500) - Main brand color for CTAs and highlights
- **Primary Light**: #1E3A8A (Blue 900) - Backgrounds and subtle accents
- **Secondary**: #94A3B8 (Slate 400) - Secondary text and icons
- **Success**: #10B981 (Emerald 500) - Success states and completed items
- **Warning**: #F59E0B (Amber 500) - Warning states and in-progress items
- **Error**: #EF4444 (Red 500) - Error states and destructive actions
- **Background**: #0F172A (Slate 900) - Main background
- **Surface**: #1E293B (Slate 800) - Card backgrounds and sections
- **Text Primary**: #F8FAFC (Slate 50) - Primary text
- **Text Secondary**: #94A3B8 (Slate 400) - Secondary text
- **Border**: #334155 (Slate 700) - Borders and dividers

**Theme Features**:

- **Theme Persistence**: User preference stored in localStorage
- **System Theme Detection**: Automatic detection of OS theme preference
- **Theme Toggle**: Accessible toggle button with three states (light/dark/system)
- **Smooth Transitions**: CSS transitions for theme switching

#### Typography

- **Font Family**: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- **Headings**:
  - H1: 2.25rem (36px), font-weight: 700
  - H2: 1.875rem (30px), font-weight: 600
  - H3: 1.5rem (24px), font-weight: 600
  - H4: 1.25rem (20px), font-weight: 600
- **Body Text**: 1rem (16px), font-weight: 400, line-height: 1.5
- **Small Text**: 0.875rem (14px), font-weight: 400
- **Caption**: 0.75rem (12px), font-weight: 500

#### Spacing System

- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px

#### Component Specifications

##### Media Card Component

- **Grid View**: 200px width, variable height based on cover aspect ratio
- **List View**: Full width, 80px height with horizontal layout
- **Cover Image**: 3:4 aspect ratio for books, 2:3 for movies
- **Rating Display**: 5-star system with filled/outlined stars
- **Status Indicator**: Color-coded badge (Want: Blue, Current: Amber, Completed: Green, Abandoned: Gray)

##### Navigation Component

- **Desktop**: Horizontal navigation bar with logo, search, and user menu
- **Mobile**: Collapsible hamburger menu with full-screen overlay
- **Search Bar**: Expandable search with real-time suggestions
- **User Menu**: Dropdown with profile, settings, and logout options
- **Theme Toggle**: Accessible button with three states (light/dark/system) and visual indicators

##### Authentication Components

- **Login Form**: Email/password fields with validation and Google OAuth button
- **Register Form**: Extended form with first name, last name, email, and password
- **Google OAuth Button**: Branded "Continue with Google" button following Google's design guidelines
- **Toast Notifications**: Non-intrusive success/error messages for authentication actions

##### Toast Notification System

- **Position**: Top-right corner of viewport
- **Duration**: 4 seconds for success, 6 seconds for errors
- **Animation**: Slide-in from right with fade-out
- **Accessibility**: Screen reader announcements and keyboard dismissible
- **Types**: Success (green), Error (red), Warning (amber), Info (blue)

### Responsive Breakpoints

- **Mobile**: 320px - 767px (single column layout)
- **Tablet**: 768px - 1023px (2-3 column grid)
- **Desktop**: 1024px - 1439px (3-4 column grid)
- **Large Desktop**: 1440px+ (4-5 column grid)

### Key User Interface Screens

#### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Bookmarked    [Search Bar]           [User Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Welcome back, Sarah!                                        │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   Books     │ │   Movies    │ │ This Month  │           │
│ │     45      │ │     32      │ │     8       │           │
│ │   Total     │ │   Total     │ │ Completed   │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ Currently Reading/Watching                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Cover] Book Title - Author        [Progress] [Edit]    │ │
│ │ [Cover] Movie Title - Director     [Status]   [Edit]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Recently Completed                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Cover] [Cover] [Cover] [Cover] [Cover]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Collection View (Grid Layout)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Bookmarked    [Search Bar]           [User Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ My Collection                                               │
│                                                             │
│ [All] [Books] [Movies]    [Filter ▼] [Sort ▼]  [+ Add]    │
│                                                             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│ │Cover│ │Cover│ │Cover│ │Cover│ │Cover│                   │
│ │ ★★★ │ │ ★★★ │ │ ★★★ │ │ ★★★ │ │ ★★★ │                   │
│ │Title│ │Title│ │Title│ │Title│ │Title│                   │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │
│                                                             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│ │Cover│ │Cover│ │Cover│ │Cover│ │Cover│                   │
│ │ ★★★ │ │ ★★★ │ │ ★★★ │ │ ★★★ │ │ ★★★ │                   │
│ │Title│ │Title│ │Title│ │Title│ │Title│                   │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │
│                                                             │
│                    [← Previous] [1] [2] [3] [Next →]       │
└─────────────────────────────────────────────────────────────┘
```

#### Add/Edit Media Modal

```
┌─────────────────────────────────────────────────────────────┐
│                     Add New Book                            │
│                                                             │
│ Type: ● Book  ○ Movie                                       │
│                                                             │
│ Title: [________________________]                          │
│ Author: [_______________________]                           │
│ Cover URL: [____________________]                           │
│                                                             │
│ Genres: [Science Fiction ×] [Adventure ×] [+ Add Genre]    │
│                                                             │
│ Status: [Want to Read ▼]                                    │
│                                                             │
│ Rating: ☆ ☆ ☆ ☆ ☆                                          │
│                                                             │
│ Review: [_________________________________________]          │
│         [_________________________________________]          │
│         [_________________________________________]          │
│                                                             │
│ Tags: [sci-fi ×] [classic ×] [+ Add Tag]                   │
│                                                             │
│                           [Cancel] [Save Book]             │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile Dashboard Layout

```
┌─────────────────────────┐
│ ☰ Bookmarked        👤 │
├─────────────────────────┤
│                         │
│ Welcome back, Sarah!    │
│                         │
│ ┌─────────────────────┐ │
│ │ Books: 45  Movies: 32│ │
│ │ Completed: 8 this mo │ │
│ └─────────────────────┘ │
│                         │
│ Currently Reading       │
│ ┌─────────────────────┐ │
│ │[📖] Book Title      │ │
│ │    Author Name      │ │
│ │    ████████░░ 80%   │ │
│ └─────────────────────┘ │
│                         │
│ Recently Completed      │
│ ┌───┐ ┌───┐ ┌───┐     │
│ │📚 │ │🎬 │ │📚 │     │
│ └───┘ └───┘ └───┘     │
│                         │
│ [+ Add New Item]        │
└─────────────────────────┘
```

---

## Technical Implementation Plan

> Updated 2026-10: the app was moved from an Express and Vite monorepo to one Next.js 16 app. This section describes the current design. The reasons and every decision are in `docs/plans/nextjs-migration.md`.

### Application Architecture

Bookmarked is one Next.js app that uses the App Router. The pages and the REST API are in the same project and share one origin, so there is no CORS setting and no second server. It deploys to Vercel as one project.

```
bookmarked/
├── src/
│   ├── proxy.ts                  # signed-out visitors go to /login (cookie check)
│   ├── app/
│   │   ├── (auth)/               # login, register
│   │   ├── (app)/                # dashboard, books, movies, latest-updates
│   │   ├── api/                  # Route Handlers: auth, users, books, movies, openai, health
│   │   └── globals.css           # color tokens for light and dark
│   ├── server/                   # server only
│   │   ├── env.ts, db.ts, rate-limit.ts
│   │   ├── auth/                 # session cookie, password hashing
│   │   ├── http/                 # route() wrapper, errors, validation helpers
│   │   ├── models/               # Mongoose models: User, Book, Movie, RateLimit
│   │   └── services/             # business logic for each module
│   ├── shared/                   # Zod schemas and types for server and client
│   ├── components/               # layout, media, ui, three (background scene)
│   └── contexts/, hooks/, lib/
├── tests/server/                 # Vitest tests
├── docs/                         # migration plan, API baseline
├── next.config.ts                # security headers
└── package.json                  # one package, no workspaces
```

### Main Dependencies

- **Framework:** Next.js 16, React 19, TypeScript
- **Data:** MongoDB with Mongoose 8
- **Auth:** `jose` (signed session cookie), `bcryptjs`
- **Validation:** Zod, shared by the API and the forms
- **UI:** Tailwind CSS 3, shadcn/ui with Radix, `next-themes`, `lucide-react`
- **Client data:** TanStack Query, React Hook Form, axios
- **3D:** `three` (plain, no wrapper library)
- **AI:** `openai`, optional
- **Quality:** ESLint 9, Vitest, `mongodb-memory-server`

### Development Environment Setup

```bash
yarn install
cp .env.example .env.local   # MONGODB_URI, JWT_SECRET, optional OPENAI_API_KEY
yarn dev                     # http://localhost:3000
yarn type-check && yarn lint && yarn test
```

### State Management Strategy

#### Server State

- **Database:** MongoDB with Mongoose. One connection is cached per server instance.
- **Session:** a signed JWT in an `httpOnly` cookie (7 days). The server checks the user in the database on each request, so a deactivated user is locked out at once.
- **Rate limits:** counters in MongoDB with a TTL index, because memory counters do not work on serverless.

#### Client State

- **Server data:** TanStack Query caches API data and refreshes it after changes.
- **Auth and theme:** React Context (`AuthContext`) and `next-themes`. The layout loads the user on the server.
- **Forms:** React Hook Form with the Zod schemas from `src/shared`.

---

## Project Roadmap & Milestones

> Update 2026-10: Phases 1 to 3 below were built as an Express and Vite monorepo. They were then migrated to one Next.js app, and the app got a new design (palette, typefaces, motion, and a quiet Three.js scene). The migration phases are in `docs/plans/nextjs-migration.md`. File names in the weekly lists below describe the original plan.

### Development Timeline: 16 Weeks Total

#### Phase 1: Foundation & Setup (Weeks 1-4)

**Goal**: Establish project foundation with TypeScript and shared types

**Week 1-2: Project Setup**

- Set up the project structure (now one Next.js app, see the 2026-10 migration)
- Create shared types and Zod schemas (now `src/shared`)
- Configure TypeScript
- Set up development environment and tooling

**Week 3-4: Backend Foundation**

- Set up the API with TypeScript (now Next.js Route Handlers)
- Configure MongoDB connection with Mongoose
- Implement Zod validation middleware
- Create user authentication system (register/login/logout)
- Set up JWT token management
- Implement basic error handling and logging

**Deliverables**:

- Working project with shared types
- Backend API with authentication endpoints
- Database models and schemas
- Development environment documentation

**Success Criteria**:

- The app builds without TypeScript errors
- User registration and login working
- JWT authentication functional
- Database connection established

#### Phase 2: Core API Development (Weeks 5-8)

**Goal**: Complete backend API with full CRUD operations

**Week 5-6: Media Management API**

- Implement media CRUD endpoints with Zod validation
- Add search and filtering functionality
- Create pagination system
- Implement user-specific data isolation
- Add genre management endpoints

**Week 7-8: Advanced API Features**

- Implement dashboard statistics endpoint
- Add data import/export functionality
- Create user preferences management
- Implement proper error responses
- Add API documentation

**Deliverables**:

- Complete REST API with all endpoints
- Comprehensive Zod validation schemas
- API documentation
- Database indexing strategy implemented

**Success Criteria**:

- All API endpoints functional and validated
- Search and filtering working correctly
- User data properly isolated
- Performance targets met (<500ms response time)

#### Phase 3: Frontend Development (Weeks 9-12)

**Goal**: Build complete React frontend with TypeScript

**Week 9-10: Frontend Foundation**

- Set up the React + TypeScript frontend (now the Next.js App Router)
- Configure TailwindCSS and design system
- Implement authentication pages (login/register)
- Create routing structure with React Router
- Set up React Query for API integration

**Week 11-12: Core UI Components**

- Build media card components (grid/list views)
- Create media form with React Hook Form + Zod
- Implement dashboard with statistics
- Add search and filtering UI
- Create responsive navigation

**Deliverables**:

- Complete React application with TypeScript
- All major UI components implemented
- Responsive design working on all breakpoints
- Authentication flow complete

**Success Criteria**:

- Frontend builds without TypeScript errors
- All user flows functional
- Responsive design working properly
- Performance targets met (<2s initial load)

#### Phase 4: Integration & Polish (Weeks 13-16)

**Goal**: Complete integration and prepare for production

**Week 13-14: Full Integration**

- Connect frontend to backend API
- Implement error handling and loading states
- Add form validation with user feedback
- Optimize API calls and caching
- Implement user preferences

**Week 15-16: Production Preparation**

- Set up production build processes
- Configure deployment environments
- Add monitoring and logging
- Performance optimization
- Security audit and hardening
- Documentation completion

**Deliverables**:

- Fully integrated application
- Production-ready builds
- Deployment documentation
- Performance optimization complete

**Success Criteria**:

- Application works end-to-end
- All performance targets met
- Security requirements satisfied
- Ready for production deployment

### Risk Assessment & Mitigation

#### High-Risk Items

1. **TypeScript Complexity**: Complex type definitions across packages

   - **Mitigation**: Start with simple types, iterate gradually
   - **Contingency**: Simplify type definitions if blocking progress

2. **Project Setup**: Tooling and build order (now one package, so this risk is gone)

   - **Mitigation**: Use proven tools (Next.js defaults)
   - **Contingency**: Fallback to separate repositories if needed

3. **Performance Requirements**: API response times and frontend loading
   - **Mitigation**: Implement caching and optimization early
   - **Contingency**: Adjust performance targets if necessary

#### Medium-Risk Items

1. **Zod Validation**: Learning curve and implementation complexity

   - **Mitigation**: Start with simple schemas, expand gradually
   - **Contingency**: Use simpler validation if Zod proves problematic

2. **React Query Integration**: Complex state management
   - **Mitigation**: Follow best practices and documentation
   - **Contingency**: Use simpler state management if needed

### Success Metrics

#### Technical Metrics

- **Build Success**: 100% successful builds across all packages
- **Type Safety**: Zero TypeScript errors in production build
- **API Performance**: 95% of requests under 500ms
- **Frontend Performance**: Initial load under 2 seconds
- **Code Quality**: ESLint passing with zero errors

#### Product Metrics

- **User Engagement**: 70%+ user retention after 30 days
- **Feature Adoption**: 80%+ of users add media items within first week
- **User Satisfaction**: 4.2+ average rating in user feedback
- **Growth**: 20% month-over-month user growth after launch

---

## Future Enhancements & Stretch Goals

### Phase 5: Social Features (Future Release)

**Goal**: Add community and social aspects while maintaining privacy focus

#### Social Sharing & Recommendations

- **Private Sharing**: Share individual items or lists with specific friends
- **Reading/Watching Groups**: Create private groups for book clubs or movie nights
- **Recommendation Engine**: AI-powered suggestions based on user preferences
- **Friend Activity**: Optional feed of friends' recently completed items
- **Review Sharing**: Share reviews with permission-based visibility

#### Community Features

- **Public Lists**: Optional public wishlists and favorites
- **Discussion Threads**: Comment on shared items and reviews
- **Reading Challenges**: Participate in community reading goals
- **Genre Communities**: Join interest-based groups for recommendations

### Phase 6: Advanced Analytics & Insights (Future Release)

**Goal**: Provide deeper insights into media consumption patterns

#### Personal Analytics Dashboard

- **Reading/Watching Patterns**: Time-based consumption analysis
- **Genre Preferences**: Visual breakdown of preferred genres over time
- **Rating Trends**: Analysis of rating patterns and preferences
- **Goal Tracking**: Set and track reading/watching goals
- **Mood Correlation**: Track how ratings correlate with completion dates

#### Advanced Reporting

- **Annual Reports**: Spotify Wrapped-style yearly summaries
- **Comparative Analysis**: Compare consumption with previous years
- **Recommendation Accuracy**: Track how often recommended items are enjoyed
- **Time Investment**: Calculate total hours spent reading/watching

### Phase 7: Third-Party Integrations (Future Release)

**Goal**: Connect with existing media platforms and services

#### Reading Platform Integration

- **Goodreads Import**: Bulk import from Goodreads with rating preservation
- **Kindle Integration**: Sync reading progress from Kindle devices
- **Library Integration**: Check local library availability
- **Bookstore APIs**: Link to purchase options (Amazon, Barnes & Noble)

#### Movie/TV Platform Integration

- **IMDb Integration**: Enhanced movie data and ratings
- **Streaming Service APIs**: Check availability across Netflix, Hulu, etc.
- **Letterboxd Import**: Import movie data and reviews
- **TV Show Tracking**: Episode-level tracking for series

### Phase 8: Mobile Applications (Future Release)

**Goal**: Native mobile apps for iOS and Android

#### Mobile-Specific Features

- **Offline Mode**: Cache data for offline viewing and editing
- **Camera Integration**: Scan book barcodes or movie posters to add items
- **Push Notifications**: Reminders for reading goals and new recommendations
- **Widget Support**: Home screen widgets for quick access to current items
- **Apple Watch/Wear OS**: Quick rating and status updates

#### Mobile Optimization

- **Native Performance**: Smooth scrolling and transitions
- **Biometric Authentication**: Face ID/Touch ID for secure access
- **Haptic Feedback**: Enhanced touch interactions
- **Dark Mode**: System-integrated dark theme

### Phase 9: Advanced Content Features (Future Release)

**Goal**: Expand beyond basic tracking to rich content management

#### Enhanced Media Types

- **Audiobooks**: Separate tracking with listening time
- **Podcasts**: Episode-level tracking and subscriptions
- **Comics/Manga**: Volume and issue tracking
- **TV Series**: Season and episode management
- **Documentaries**: Subject-based categorization

#### Rich Content Management

- **Series Management**: Link related books/movies in series
- **Author/Director Pages**: Dedicated pages with all works
- **Timeline View**: Chronological view of consumption
- **Collections**: Custom collections beyond basic lists
- **Notes and Quotes**: Rich text notes with highlighting

### Phase 10: AI and Machine Learning (Future Release)

**Goal**: Leverage AI for personalized experiences

#### Intelligent Features

- **Smart Categorization**: Auto-suggest genres and tags
- **Mood-Based Recommendations**: Suggest content based on current mood
- **Reading Time Prediction**: Estimate time to complete books
- **Content Warnings**: AI-generated content warnings for sensitive topics
- **Summary Generation**: AI-generated plot summaries for personal reference

#### Personalization Engine

- **Adaptive Interface**: UI that adapts to user behavior
- **Smart Notifications**: Contextual reminders and suggestions
- **Predictive Search**: Search suggestions based on user patterns
- **Dynamic Filtering**: Auto-adjust filters based on preferences

### Technical Debt & Infrastructure Improvements

#### Performance Optimizations

- **Database Sharding**: Scale database for millions of users
- **CDN Implementation**: Global content delivery for images
- **Caching Strategy**: Redis implementation for frequently accessed data
- **Search Optimization**: Elasticsearch for advanced search capabilities

#### Developer Experience

- **GraphQL API**: More flexible API for mobile and web clients
- **Microservices Architecture**: Break monolith into focused services
- **Real-time Features**: WebSocket implementation for live updates
- **API Rate Limiting**: Advanced rate limiting with user tiers

### Monetization Considerations (Future)

#### Freemium Model Options

- **Basic Tier**: Limited items (100 books/movies), basic features
- **Premium Tier**: Unlimited items, advanced analytics, priority support
- **Pro Tier**: All features, API access, white-label options

#### Revenue Streams

- **Subscription Plans**: Monthly/yearly premium subscriptions
- **Affiliate Marketing**: Book/movie purchase referrals
- **API Licensing**: Paid API access for third-party developers
- **Enterprise Solutions**: Team/organization accounts

### Success Metrics for Future Phases

#### Engagement Metrics

- **Daily Active Users**: 40%+ of registered users active daily
- **Session Duration**: Average 8+ minutes per session
- **Feature Adoption**: 60%+ adoption rate for new features
- **User-Generated Content**: 80%+ of users add reviews/ratings

#### Business Metrics

- **Premium Conversion**: 15%+ conversion to paid plans
- **Customer Lifetime Value**: $50+ average LTV
- **Churn Rate**: <5% monthly churn for premium users
- **Net Promoter Score**: 50+ NPS score

---

## Conclusion

This Project Requirements Document provides a comprehensive roadmap for building Bookmarked, a personal media tracking application that prioritizes simplicity, visual appeal, and user privacy. The phased approach ensures a solid foundation while allowing for future growth and feature expansion.

The technical architecture leverages modern, proven technologies (Next.js, React, MongoDB) with a TypeScript-first single Next.js app that supports scalable development. The emphasis on type safety, performance, and accessibility ensures a high-quality user experience across all devices.

Key success factors include:

- **User-Centric Design**: Clean, intuitive interface focused on the core use case
- **Technical Excellence**: Robust TypeScript architecture with comprehensive validation
- **Scalable Foundation**: One typed Next.js app with shared schemas that supports future enhancements
- **Privacy Focus**: Personal tracking without social pressure
- **Performance First**: Fast, responsive experience on all devices
- **Type Safety**: Full TypeScript integration across the entire stack

This PRD serves as the definitive guide for development teams to build Bookmarked from concept to production, with clear milestones, success criteria, and future growth opportunities.
