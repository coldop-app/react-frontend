# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0-beta.9] - 2025-12-06

### Added

- Comprehensive preferences management page with full CRUD operations for commodities, bag sizes, and varieties
- Drag-and-drop reordering functionality for commodities, bag sizes, and varieties using @dnd-kit
- Optimistic updates for instant UI feedback when updating preferences
- Store state synchronization - preferences updates automatically sync with Zustand store
- Modular component architecture for preferences settings (CommodityTabs, BagSizesList, VarietiesTable, etc.)
- Confirmation dialogs for all delete operations to prevent accidental data loss
- SortableItem and SortableTableRow reusable components for drag-and-drop functionality
- Preferences service hooks (usePreferences, useUpdatePreferences) with query key management

### Changed

- Refactored preferences settings into smaller, maintainable components
- Enhanced preferences update mutation with optimistic updates and automatic rollback on errors
- Improved preferences type definitions to include message property in API responses
- Updated store to include updatePreferences method for state synchronization

## [0.3.0-beta.8] - 2025-12-06

### Added

- Variety breakdown page with comprehensive variety analytics
- Variety analytics components: OverviewCards, GraphicalAnalysis, LocationBreakdown, FarmerBreakdown, SizeTable
- Variety analysis service hook (`useVarietyAnalysis`, `usePrefetchVarietyAnalysis`) with optimized query management
- Settings route for store admin configuration
- Variety analysis types and utilities for data processing

### Changed

- Enhanced analytics components with improved data handling
- Updated outgoing order form with better validation and error handling
- Improved farmer profile components with enhanced stock summary display
- Updated analytics service keys for better query management
- Enhanced order fetching services with improved error handling

## [0.3.0-beta.7] - 2025-12-06

### Added

- Comprehensive analytics dashboard with multiple visualization components
- Commodity breakdown component with collapsible sections showing variety and bag size details
- Location analytics table component with detailed farmer breakdown by location
- Analytics service hooks (`useAnalyticsOverview`, `usePrefetchAnalyticsOverview`) with query key management
- Analytics type definitions for API responses and data structures
- Accordion UI component from shadcn/ui for collapsible content sections
- Commodity filtering functionality across all analytics components

### Changed

- Enhanced analytics overview page with improved data transformation and filtering
- Updated existing analytics components (capacity utilization, stock summary, stock trend, variety distribution, top farmers) with commodity filtering support
- Improved analytics data processing with better filtering and aggregation logic
- Enhanced analytics components with responsive design improvements

## [0.3.0-beta.6] - 2025-12-06

### Added

- Alert UI component from shadcn/ui with variants and accessibility support
- Badge UI component from shadcn/ui with multiple variants
- Screenshot assets for documentation

### Changed

- Enhanced farmer profile component with improved functionality
- Updated farmer profile helpers with additional utility functions
- Improved incoming order form and summary sheet components
- Enhanced order creation hooks for incoming and outgoing orders
- Updated gate pass number retrieval logic
- Refined daybook orders service hook

## [0.3.0-beta.5] - 2025-12-01

### Added

- People management page with farmer listing and search functionality
- Farmer profile component with detailed farmer information display
- Stock summary table component for displaying farmer stock data
- Spinner UI component for loading states
- Dynamic route for individual farmer profiles (`people.$farmerStorageLinkId.tsx`)
- HistoryState interface for passing farmer data through navigation

### Changed

- Restructured people routes with new route naming convention (`people_.tsx`)
- Updated logout service implementation
- Enhanced router type definitions with HistoryState interface

### Removed

- Removed old `people.tsx` route in favor of new route structure

## [0.3.0-beta.4] - 2025-12-01

### Added

- Complete outgoing order form with comprehensive order creation capabilities
- Outgoing order quantity dialog component for managing order quantities
- Outgoing order step info and step summary components
- Outgoing order summary sheet with order review
- Custom hook for outgoing order management (`useOutgoingOrder`)
- Checkbox UI component from shadcn/ui

### Changed

- Enhanced incoming order summary sheet with improved functionality
- Updated receipt voucher card component
- Improved outgoing orders service hooks
- Enhanced edit incoming order service
- Updated authentication service hooks
- Refined order fetching services

## [0.3.0-beta.3] - 2025-12-01

### Added

- Complete incoming order form with comprehensive order creation capabilities
- Farmer search component with searchable farmer selection
- Commodity selector component for selecting order commodity
- Date picker component with calendar integration
- Variety entry component supporting multiple varieties per order
- Quantity input component with support for multiple bag sizes
- Location input component for chamber, floor, and row tracking
- Order number display component showing gate pass numbers
- Variety selector component for selecting available varieties
- Add farmer modal component for registering new farmers
- Incoming order summary sheet with order review and remarks
- Search selector component with searchable dropdown functionality
- Enter navigation hook for keyboard navigation support
- Incoming order form schema with Zod validation
- Support for null voucher creation with disabled form fields
- Custom marka field support based on preferences
- Multiple variety management with add/remove functionality
- New store admin routes: incoming, outgoing, analytics, and people pages
- Additional shadcn/ui components: Calendar, Command, Popover, Tabs

### Changed

- Updated form components index to export all form components
- Enhanced incoming order services with improved error handling
- Improved gate pass number retrieval logic

### Fixed

- Fixed type import errors by using type-only imports for TypeScript types
- Fixed missing FarmerSearch export in forms index
- Fixed implicit any type in FarmerSearch onSelect callback
- Fixed unnecessary React Hook dependency in orderDate useMemo
- Fixed linting errors in incoming order form component

## [0.3.0-beta.2] - 2025-12-01

### Changed

- Optimized navbar and sidebar components to prevent unnecessary re-renders during navigation
- Replaced anchor tags with TanStack Router Link components in sidebar for client-side navigation
- Memoized static components (UserAvatar, ThemeToggle, UserMenu, NavbarStaticContent) to prevent flickering
- Split navbar into static and dynamic parts - only page title re-renders on route changes
- Improved AppSidebar performance by deriving state from pathname instead of using useEffect
- Removed Next.js-specific 'use client' directive from UserAvatar component

### Fixed

- Fixed flickering issues in ThemeToggle and UserAvatar components during navigation
- Fixed linting errors related to function expressions in memoized components
- Fixed React Hook dependency warnings in AppSidebar component

## [0.3.0-beta.1] - 2025-12-01

### Added

- Complete daybook page with search, filtering, sorting, and pagination functionality
- Authentication guard route (`_authenticated.tsx`) for protecting authenticated routes
- App sidebar component with navigation and user information
- Navbar component for top-level navigation
- Theme toggle component for dark/light mode switching
- User avatar component with dropdown menu
- Logout button component with confirmation dialog
- Receipt voucher card component for displaying incoming orders
- Delivery voucher card component for displaying outgoing orders
- Edit incoming order form dialog with comprehensive order editing capabilities
- Daybook toolbar component with search bar and filter dropdowns
- Daybook action buttons component for order management
- Service hooks: `useDaybookOrders`, `useGetAllFarmers`, `useGetOrdersOfFarmer`, `useRegisterFarmer`, `useStoreAdminLogout`
- Type definitions for incoming and outgoing orders
- Schema for store admin farmer registration
- Additional shadcn/ui components: AlertDialog, Avatar, Collapsible, DataTable, Dialog, DropdownMenu, Pagination, Separator, Sheet, Sidebar, Skeleton, Table, Textarea, Tooltip
- Mobile responsive hook (`use-mobile.ts`) for detecting mobile devices

### Changed

- Updated authentication routes structure with protected route wrapper
- Enhanced store structure with receipt column visibility management
- Updated query client configuration for better error handling
- Improved axios configuration with better interceptor setup
- Updated helper functions for authentication checks

### Removed

- Removed `App.test.tsx` test file
- Removed old daybook route structure in favor of new authenticated route organization

## [0.3.0-beta.0] - 2025-01-27

### Added

- Complete authentication system with login and register components
- Store admin login mutation hook with TanStack Query integration
- Form validation schemas using Zod for store admin login and registration
- Axios client setup with interceptors for API communication and cookie handling
- Zustand store for managing admin authentication state and preferences
- Type definitions for store admin, cold storage, daybook, farmers, and API responses
- Service hooks for incoming/outgoing orders, preferences, and gate pass operations
- Authentication routes (`/auth/login`, `/auth/register`)
- Store admin routes structure (`/store-admin/daybook`)
- Additional shadcn/ui components: Card, Form, Input, Label, and HoverCard
- React Hook Form integration with Zod resolver for form management
- Environment constants utility for API configuration
- Password visibility toggle in login and register forms

### Changed

- Restructured route organization with dedicated auth and store-admin directories
- Updated root route to maintain QueryClientProvider and Toaster setup
- Removed old daybook route structure in favor of new store-admin organization

### Dependencies

- Added `axios` for HTTP client functionality
- Added `react-hook-form` for form state management
- Added `@hookform/resolvers` for Zod integration with react-hook-form
- Added `zod` for schema validation

## [0.2.0-beta.1] - 2025-01-27

### Added

- Font loading utility system (`fonts.ts`) with support for Lusitana, Montserrat, and Geist Mono fonts
- Font CSS variables and utility classes (`app.css`) for easy font application
- Select component from shadcn/ui with full Radix UI integration
- Font demonstration in DaybookPage component

## [0.2.0-beta.0] - 2025-01-27

### Added

- Zustand state management library setup with example store
- TanStack Query v5 for server state management
- Sonner toast notification component from shadcn/ui
- QueryClient configuration with default options
- TanStack Query ESLint plugin for better DX
- Example implementations in DaybookPage demonstrating all new features

### Changed

- Updated root route to include QueryClientProvider and Toaster components
- Enhanced ESLint configuration with TanStack Query rules

## [0.1.0-beta.0] - 2025-01-27

### Added

- Initial project setup with React 19 and TypeScript
- Vite build tooling with rolldown for faster builds
- Vitest testing framework with coverage support
- ESLint and Prettier for code quality and formatting
- Husky git hooks for pre-commit and commit-msg validation
- Commitlint with conventional commits configuration
- Tailwind CSS v4 with shadcn/ui components
- React Compiler integration
- Production-ready development and build configuration

### Changed

- Updated `.gitignore` with comprehensive ignore patterns
- Enhanced README with comprehensive documentation
