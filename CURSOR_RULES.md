# Cursor Rules & Development Guidelines

## Feature-Based Development

- All new features must be developed using a feature-based approach.
- For each feature, both backend (API, models, logic) and frontend (UI, state, integration) should be implemented together.
- Avoid separating work into backend-only or frontend-only phases.
- Each feature should be end-to-end testable before moving to the next.

## Why?
- Faster feedback and integration
- Easier testing and debugging
- Better collaboration between frontend and backend
- Incremental, demo-able progress

## Exceptions
- Only for urgent bug fixes or infrastructure changes that do not map to a user-facing feature.

*All contributors must follow this rule for all new work.* 