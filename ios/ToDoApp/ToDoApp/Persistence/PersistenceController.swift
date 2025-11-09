import Foundation
import CoreData

enum PersistenceError: Error {
    case storeInitializationFailed
}

final class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentCloudKitContainer

    init(inMemory: Bool = false) {
        container = NSPersistentCloudKitContainer(name: "TaskModel")

        if inMemory {
            let description = NSPersistentStoreDescription()
            description.url = URL(fileURLWithPath: "/dev/null")
            container.persistentStoreDescriptions = [description]
        }

        guard let description = container.persistentStoreDescriptions.first else {
            fatalError("Missing persistent store description")
        }

        description.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(containerIdentifier: "iCloud.com.example.todoapp")
        description.setValue(true, forPragmaNamed: "journal_mode")

        container.loadPersistentStores { [weak container] _, error in
            if let error {
                fatalError("Unresolved error \(error)")
            }
            container?.viewContext.automaticallyMergesChangesFromParent = true
            container?.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        }

        NotificationCenter.default.addObserver(self,
                                               selector: #selector(processRemoteStoreChange(_:)),
                                               name: .NSPersistentStoreRemoteChange,
                                               object: container.persistentStoreCoordinator)
    }

    func save() {
        let context = container.viewContext
        guard context.hasChanges else { return }
        do {
            try context.save()
        } catch {
            context.rollback()
            assertionFailure("Failed to save context: \(error)")
        }
    }

    @objc private func processRemoteStoreChange(_ notification: Notification) {
        NotificationCenter.default.post(name: .tasksDidSync, object: nil)
    }
}

extension Notification.Name {
    static let tasksDidSync = Notification.Name("tasksDidSync")
}
