# Task Definition for Claude

## Objective
Implement the **Post Tab (投稿タブ)** and its related features (Post List, Post Details Modal) based on the newly defined requirements and design.

## References
1. **Requirements**: `docs/requirements.md` (Section: 投稿タブ修正要件)
   - Adhere strictly to the Figma design mentioned (docs/figma/post.png).
2. **Design**: `docs/design.md` (Section: 2. 投稿タブ設計)

## Scope of Work

### 1. Page & Layout Implementation
- Create/Update `pages/post.tsx` (or appropriate route) for the Post Tab.
- Ensure the Global Header and Tab Navigation are consistent with the Home Tab.

### 2. Post List Feature
- **View Toggle**: Implement Grid View and List View switching.
- **Components**:
  - `PostGridItem`: Square card with thumbnail and status.
  - `PostListItem`: Vertical card with thumbnail, title, and metrics.
- **Controls**:
  - Display total post count.
  - Implement "Sort" modal/bottom sheet (Date, Effect, Likes, Comments, Access).
  - Implement "Hidden" filter toggle.

### 3. Post Detail Modal
- Implement a modal that opens when a post item is clicked.
- **Content**: User info, Status badge, Close button, Image, Title, Body, Date, Tags, Metrics (e.g., Attraction Rate bar).
- **Actions**: "Edit Post" button, Status Toggle (Show/Hide).

### 4. State Management & Data
- Use **Dummy Data** for posts.
- Manage state for:
  - View mode (Grid/List)
  - Filter (Show/Hide hidden posts)
  - Sort order
  - Post Status (Show/Hide) - toggling this should update the UI immediately.

## Constraints
- **Figma Compliance**: Layout, spacing, colors, and font usage must match the Figma design screenshot provided in requirements.
- **Mobile First**: Optimize for smartphone display.
- **No Real API**: Do not connect to a real backend yet; mock the data handling.

## Deliverables
- Functional Post Tab with all UI states implemented.
- Verified interaction for toggles, modals, and filters.