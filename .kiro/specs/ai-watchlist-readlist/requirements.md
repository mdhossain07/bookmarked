# Requirements Document

## Introduction

This feature enhances the existing OpenAI-powered search functionality by adding the ability for users to directly add recommended books and movies to their personal collections. When users receive AI-generated recommendations for books or movies, they will see an "Add to WatchList/ReadList" button that opens a modal allowing them to select and add multiple items to their collection with appropriate default statuses ("to read" for books, "to watch" for movies).

## Requirements

### Requirement 1

**User Story:** As a user who has received AI recommendations for books or movies, I want to see an "Add to WatchList/ReadList" button after the AI response, so that I can easily add recommended items to my collection without manually entering all the details.

#### Acceptance Criteria

1. WHEN the AI search returns recommendations for books or movies THEN the system SHALL display an "Add to WatchList/ReadList" button below the AI response
2. WHEN the AI response contains both books and movies THEN the system SHALL display separate buttons for "Add to ReadList" and "Add to WatchList"
3. WHEN the AI response contains only books THEN the system SHALL display only an "Add to ReadList" button
4. WHEN the AI response contains only movies THEN the system SHALL display only an "Add to WatchList" button
5. WHEN the AI response contains no identifiable books or movies THEN the system SHALL NOT display any add buttons

### Requirement 2

**User Story:** As a user clicking the "Add to WatchList/ReadList" button, I want to see a modal with all the books/movies mentioned in the AI response, so that I can review and select which items I want to add to my collection.

#### Acceptance Criteria

1. WHEN the user clicks "Add to ReadList" THEN the system SHALL open a modal displaying all books mentioned in the AI response
2. WHEN the user clicks "Add to WatchList" THEN the system SHALL open a modal displaying all movies mentioned in the AI response
3. WHEN displaying items in the modal THEN the system SHALL show title, author/director (if available), and any other extracted details for each item
4. WHEN displaying items in the modal THEN the system SHALL provide checkboxes for each item to allow multi-selection
5. WHEN the modal opens THEN the system SHALL have all items unchecked by default
6. WHEN no items can be extracted from the AI response THEN the system SHALL display a message indicating no items were found

### Requirement 3

**User Story:** As a user selecting items in the modal, I want to choose multiple books or movies and add them all at once, so that I can efficiently build my collection from AI recommendations.

#### Acceptance Criteria

1. WHEN the user selects one or more items THEN the system SHALL enable an "Add Selected" button
2. WHEN no items are selected THEN the system SHALL keep the "Add Selected" button disabled
3. WHEN the user clicks "Add Selected" THEN the system SHALL add all selected items to the appropriate collection (Books or Movies)
4. WHEN adding books THEN the system SHALL set the default status to "will read"
5. WHEN adding movies THEN the system SHALL set the default status to "to watch"
6. WHEN items are successfully added THEN the system SHALL display a success message indicating how many items were added
7. WHEN items are successfully added THEN the system SHALL close the modal

### Requirement 4

**User Story:** As a user adding items from AI recommendations, I want the system to extract as much information as possible from the AI response, so that my collection entries are as complete as possible without manual data entry.

#### Acceptance Criteria

1. WHEN extracting book information THEN the system SHALL attempt to identify title, author, genre, and description from the AI response
2. WHEN extracting movie information THEN the system SHALL attempt to identify title, director, genre, industry, and description from the AI response
3. WHEN information cannot be extracted THEN the system SHALL leave those fields empty for the user to fill later
4. WHEN adding extracted items THEN the system SHALL use the extracted information to populate the database fields
5. WHEN the same book or movie already exists in the user's collection THEN the system SHALL display a warning and ask for confirmation before adding duplicates

### Requirement 5

**User Story:** As a user who has added items from AI recommendations, I want to be able to edit the added items later, so that I can complete or correct any missing or incorrect information.

#### Acceptance Criteria

1. WHEN items are added from AI recommendations THEN the system SHALL create them with the same editing capabilities as manually added items
2. WHEN viewing added items in the Books or Movies pages THEN the system SHALL allow users to edit them using the existing modal functionality
3. WHEN editing AI-added items THEN the system SHALL preserve any manually entered information
4. WHEN AI-extracted information is incomplete THEN the system SHALL allow users to add missing details through the edit functionality

### Requirement 6

**User Story:** As a user, I want the AI recommendation parsing to work reliably across different types of responses, so that the feature works consistently regardless of how the AI formats its recommendations.

#### Acceptance Criteria

1. WHEN the AI response contains structured lists THEN the system SHALL parse items from bulleted or numbered lists
2. WHEN the AI response contains narrative text THEN the system SHALL identify books and movies mentioned within paragraphs
3. WHEN the AI response uses different formatting styles THEN the system SHALL handle various text patterns for titles and authors/directors
4. WHEN the AI response contains ambiguous references THEN the system SHALL err on the side of inclusion rather than exclusion
5. WHEN parsing fails to identify clear items THEN the system SHALL gracefully handle the error and inform the user
