# Task Definition for Claude

## Objective
Adjust the Report Tab layout to a single column format as per the latest feedback, while maintaining all existing functional and visual improvements.

## References
1. **Review**: `docs/review.md` (Updated 2026-02-06: Worker requested 1-column layout).

## Scope of Work

### 1. Layout Adjustment
- **Single Column Layout (`ReportTab.tsx`)**:
  - **Issue**: The current grid layout (2 columns on tablet/desktop) is deemed "weird" by the reviewer.
  - **Action**: Change the root container of `ReportTab` to a **single column** layout for all screen sizes. 
  - **Implementation**: Use `flex flex-col gap-4` or `grid grid-cols-1 gap-4`. Remove all `sm:grid-cols-2` and `sm:col-span-2` classes. All cards (KPI cards, charts, etc.) should take the full width of the container.

### 2. Maintenance of Previous Improvements
- Ensure the following remain intact after the layout change:
  - **MEO Rank History**: Chart -> Keyword List (ascending rank sort) -> Disclaimer order.
  - **MEO Rank History**: `invertYAxis={true}` and circular plot points.
  - **Breakdown Charts**: Horizontal layout (Chart Left, List Right) for "Media Breakdown", "Instagram Source", and "Google Search Keywords".
  - **Typography**: Emphasized numbers in "Review Reply Performance" and correct Tailwind classes for KPI numbers.
  - **Tooltips**: Tap-to-toggle interaction logic.

## Test Items (Verification Criteria)

### A. Layout & Structure
- [ ] **Single Column**: All elements are stacked vertically in a single column regardless of screen width.
- [ ] **Full Width**: Each card/section spans the full width of the parent container (minus padding).

### B. Visual Consistency
- [ ] **Charts**: Breakdown sections still show the chart and list side-by-side horizontally within their full-width cards.
- [ ] **Spacing**: Gap between vertical elements is consistent (`gap-4`).

### C. Build & Quality
- [ ] **Build**: `npm run build` passes without errors.
- [ ] **Clean Code**: No leftover `col-span` or multi-column grid classes.
