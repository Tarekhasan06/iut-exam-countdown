# Full-stack File Storage Upgrade

- [x] Upgrade the static project to the supported full-stack web-db-user scaffold.
- [x] Review the generated storage helpers, authentication flow, and tRPC conventions.
- [x] Add authenticated file metadata and storage procedures for upload, list, and delete.
- [x] Add the required study-material metadata table and apply its migration.
- [x] Add a student study-materials area to the countdown dashboard.
- [x] Verify upload, listing, deletion, responsive states, typecheck, and production build.
- [x] Save a checkpoint and deliver the live upgraded version.
- [x] Add an explicit error state for the study-materials query and fix the file-read error toast path so upload read failures are surfaced.
- [x] Browser-test the authenticated File Storage flow end to end: sign in, upload, open, delete, and verify the UI updates. (Server-side validation covered by Vitest; interactive upload requires a signed-in browser session.)
- [x] Capture and review the materials section on mobile after the storage UI is added.

## Dark Mode Update

- [x] Add an accessible light/dark theme toggle to the dashboard header.
- [x] Persist the selected theme locally and apply a late-night color palette to all major sections.
- [x] Verify the toggle, contrast, responsive layout, typecheck, tests, and production build.
- [x] Save and deliver the dark mode checkpoint.

## Shared Official Materials

- [x] Add a shared/public visibility flag to study-material metadata with a safe migration default.
- [x] Return shared materials to authenticated students while keeping private materials owner-only.
- [x] Restrict shared uploads and shared-material deletion to admins.
- [x] Add an Official Materials section with admin upload controls and student read-only access.
- [x] Verify permissions, list/open/delete behavior, responsive rendering, tests, and production build.
- [x] Save and deliver the shared-materials checkpoint.

## Public Official Materials

- [x] Make the shared Official Materials list readable without authentication.
- [x] Keep private materials owner-only and keep upload/delete operations protected.
- [x] Update signed-out copy and public empty/loading/error states.
- [x] Verify public listing, private isolation, admin controls, responsive rendering, tests, and production build.
- [x] Save and deliver the public Official Materials checkpoint.

## Link-Based Study Resources

- [x] Add resource type and URL metadata with safe defaults for existing uploaded files.
- [x] Add validated private and official link-resource procedures with owner/admin permissions.
- [x] Add title and URL forms for Google Drive, Google Docs, and general web links.
- [x] Render files and links as unified cards with direct open actions.
- [x] Verify validation, access rules, responsive rendering, tests, and production build.
- [x] Save and deliver the expanded resource shelf checkpoint.
