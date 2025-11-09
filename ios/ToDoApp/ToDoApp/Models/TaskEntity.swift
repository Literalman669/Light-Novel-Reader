import Foundation
import CoreData

@objc(TaskEntity)
final class TaskEntity: NSManagedObject, Identifiable {
    @NSManaged var id: UUID
    @NSManaged var title: String
    @NSManaged var details: String?
    @NSManaged var dueDate: Date?
    @NSManaged var priorityRawValue: String
    @NSManaged var isCompleted: Bool
    @NSManaged @objc(tags) private var tagsStorage: [String]?
    @NSManaged var createdAt: Date
    @NSManaged var updatedAt: Date
}

extension TaskEntity {
    @nonobjc class func fetchRequest() -> NSFetchRequest<TaskEntity> {
        NSFetchRequest<TaskEntity>(entityName: "TaskEntity")
    }

    var priority: TaskPriority {
        get { TaskPriority(rawValue: priorityRawValue) ?? .medium }
        set { priorityRawValue = newValue.rawValue }
    }

    var isOverdue: Bool {
        guard let dueDate else { return false }
        return dueDate < Date() && !isCompleted
    }

    func update(using model: TaskDraft) {
        title = model.title
        details = model.details
        dueDate = model.dueDate
        priority = model.priority
        tags = model.tags
        isCompleted = model.isCompleted
        updatedAt = Date()
    }

    var tags: [String] {
        get { tagsStorage ?? [] }
        set { tagsStorage = newValue }
    }
}

struct TaskDraft {
    var id: UUID? = nil
    var title: String = ""
    var details: String? = nil
    var dueDate: Date? = nil
    var priority: TaskPriority = .medium
    var tags: [String] = []
    var isCompleted: Bool = false

    init(task: TaskEntity?) {
        if let task {
            id = task.id
            title = task.title
            details = task.details
            dueDate = task.dueDate
            priority = task.priority
            tags = task.tags
            isCompleted = task.isCompleted
        }
    }

    init() {}
}
