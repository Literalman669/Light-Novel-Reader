import Foundation
import AppIntents
import CoreData

struct AddQuickTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Quick Task"

    @Parameter(title: "Title")
    var title: String

    @Parameter(title: "Priority")
    var priority: TaskPriority

    func perform() async throws -> some IntentResult {
        let context = PersistenceController.shared.container.viewContext
        try await context.perform {
            let task = TaskEntity(context: context)
            task.id = UUID()
            task.title = title
            task.priority = priority
            task.createdAt = Date()
            task.updatedAt = Date()
            try context.save()
        }
        return .result(value: "Task created")
    }
}

struct MarkTaskCompleteIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"

    @Parameter(title: "Task ID")
    var taskID: String

    func perform() async throws -> some IntentResult {
        let context = PersistenceController.shared.container.viewContext
        guard let uuid = UUID(uuidString: taskID) else {
            throw IntentError.invalidIdentifier
        }

        return try await context.perform { () -> IntentResult in
            let request: NSFetchRequest<TaskEntity> = TaskEntity.fetchRequest()
            request.predicate = NSPredicate(format: "id == %@", uuid as CVarArg)
            request.fetchLimit = 1
            guard let task = try context.fetch(request).first else {
                throw IntentError.taskNotFound
            }
            task.isCompleted = true
            task.updatedAt = Date()
            try context.save()
            return .result(value: "Task marked complete")
        }
    }
}

enum IntentError: Error, CustomLocalizedStringResourceConvertible {
    case invalidIdentifier
    case taskNotFound

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .invalidIdentifier:
            return "The provided identifier is invalid."
        case .taskNotFound:
            return "The task could not be located."
        }
    }
}
