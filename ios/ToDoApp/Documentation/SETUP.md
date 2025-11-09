# Setup & Deployment Guide

## Requirements
- Xcode 15 or later
- iOS 15+ deployment target
- Apple Developer Program membership for CloudKit and push notifications

## Project Configuration
1. Open the Xcode project and ensure the bundle identifier matches your team domain (e.g., `com.yourcompany.todo`).
2. Enable the following capabilities for the app target:
   - iCloud with CloudKit (select the appropriate container or create a new one).
   - Push Notifications and Background Modes (Remote notifications).
   - Siri and App Intents.
   - Widgets extension with the same app group if using shared configuration.
3. Update the `containerIdentifier` in `PersistenceController` to match the CloudKit container you provisioned.
4. Configure Signing & Capabilities for all targets (App, Widget, Tests) with valid provisioning profiles.

## Running Locally
1. Select an iPhone simulator (iPhone 15 recommended) and run `Cmd+R`.
2. Grant notification permissions when prompted.
3. Use the in-app toolbar to add, filter, and export tasks.
4. Test widgets by adding the "Upcoming Tasks" widget from the widget gallery.

## Testing
Run the following schemes:
- **Unit Tests**: `Cmd+U` on `ToDoApp` target.
- **UI Tests**: `Cmd+U` on `ToDoAppUITests`.
- **Performance Tests**: Execute via the Test navigator; analyze results in the "Performance" tab.

## App Store Submission
1. Update app metadata (icons, launch screens, marketing assets).
2. Increment the version and build numbers.
3. Archive (`Product > Archive`) and validate using Xcode's Organizer.
4. Upload to App Store Connect, complete the app listing, and submit for review.
5. Ensure compliance with Apple's Human Interface Guidelines.
