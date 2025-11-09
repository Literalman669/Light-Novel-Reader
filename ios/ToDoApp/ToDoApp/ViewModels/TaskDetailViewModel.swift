import Foundation
import CoreData

final class TaskDetailViewModel: ObservableObject {
    @Published var draft: TaskDraft
    @Published var isNewTask: Bool
    @Published var reminderEnabled: Bool

    private let context: NSManagedObjectContext
    private let sourceTask: TaskEntity?

    init(context: NSManagedObjectContext, task: TaskEntity?, preselectedFilter: TaskFilter? = nil) {
        self.context = context
        self.sourceTask = task
        self.isNewTask = task == nil

        if let task {
            draft = TaskDraft(task: task)
        } else {
            draft = TaskDraft()
            if let filterPriority = preselectedFilter?.priority {
                draft.priority = filterPriority
            }
            if let tags = preselectedFilter?.tags {
                draft.tags = Array(tags)
            }
        }

        reminderEnabled = draft.dueDate != nil
    }

    func toggleCompletion() {
        draft.isCompleted.toggle()
    }

    func save() throws {
        if !reminderEnabled {
            draft.dueDate = nil
        }
        if let task = sourceTask {
            task.update(using: draft)
            if reminderEnabled {
                scheduleReminder(for: task)
            } else {
                NotificationService.shared.removeNotification(for: task.id)
            }
        } else {
            let newTask = TaskEntity(context: context)
            newTask.id = draft.id ?? UUID()
            newTask.createdAt = Date()
            newTask.update(using: draft)
            if reminderEnabled {
                scheduleReminder(for: newTask)
            }
        }

        try context.save()
    }

    private func scheduleReminder(for task: TaskEntity) {
        guard let dueDate = draft.dueDate ?? task.dueDate else { return }
        NotificationService.shared.scheduleNotification(for: task.id,
                                                        title: draft.title,
                                                        body: draft.details ?? "",
                                                        dueDate: dueDate)
    }
}
