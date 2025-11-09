# Architecture Overview

The ToDoApp project follows a modular SwiftUI architecture composed of the following layers:

## Layers

### Persistence
- `PersistenceController` encapsulates the `NSPersistentCloudKitContainer` setup.
- Core Data model (`TaskEntity`) stores task metadata, including tags and priority.
- CloudKit sync is enabled via `NSPersistentCloudKitContainerOptions` with background merge support.

### Models
- `TaskEntity` provides the Core Data managed object model.
- `TaskDraft` is a value-type intermediary for form editing.
- `TaskPriority`, `TaskFilter`, and supporting enums encapsulate business logic.

### View Models
- `TaskListViewModel` coordinates fetches, filtering, notifications, and exports.
- `TaskDetailViewModel` manages create/edit flows, bridging between UI and persistence.

### Views
- `ContentView` provides the navigation shell with filter/add controls.
- `TaskListView` renders lists, search, and toolbar actions.
- `TaskFormView` handles CRUD operations with SwiftUI forms.
- Reusable `TaskRowView` & `TagEditor` components provide consistent UI.

### Services
- `NotificationService` wraps push notification registration/scheduling.
- `ShareService` delivers `UIActivityViewController` payloads for sharing.
- `BackupManager` exports JSON backups of the Core Data store.

### Platform Extensions
- Widgets via `ToDoWidget` fetch top tasks and display them inline.
- Siri Shortcuts via `AppIntents` for quick add/complete actions.

### Testing Targets
- `ToDoAppTests` includes unit coverage for view models and persistence operations.
- `ToDoAppUITests` validates primary happy-path flows.
- `ToDoAppPerformanceTests` measures fetch/memory behavior for large datasets.

## Data Flow
1. UI events trigger view model actions (create/edit/toggle).
2. View models mutate Core Data entities and schedule notifications.
3. `PersistenceController` persists changes locally and syncs via CloudKit.
4. Widgets and Siri Shortcuts read from the same persistent store.

## Theming
- SwiftUI environment automatically honors Light/Dark appearance.
- UI components use semantic colors and SF Symbols to remain adaptive.
