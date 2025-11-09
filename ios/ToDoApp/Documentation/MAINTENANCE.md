# Maintenance Guidelines

## Code Quality
- Run `swiftlint` (if installed) to enforce style consistency.
- Maintain 80%+ unit test coverage for critical logic.
- Prefer SwiftUI previews for iterative UI development.

## Data Model Changes
- Update `TaskModel.xcdatamodeld` using Xcode's data model editor.
- Bump the Core Data model version when modifying entities/attributes.
- Provide lightweight migration policies whenever possible.

## Notifications & Background Tasks
- Periodically verify push certificates in the Apple Developer portal.
- Ensure background fetch remains enabled after capability updates.

## iCloud Sync
- Monitor CloudKit dashboards for schema changes or throttling alerts.
- Validate new features on real devices signed into multiple iCloud accounts.

## Release Checklist
1. Update release notes and marketing screenshots.
2. Bump build number and tag the release in source control.
3. Execute full regression test suite on latest iOS version.
4. Validate widget and Siri shortcut behavior on device.
5. Profile with Instruments (Leaks & Allocations) to ensure no regressions.
6. Archive, notarize, and submit build to App Store Connect.
