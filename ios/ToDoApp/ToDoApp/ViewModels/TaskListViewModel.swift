import Foundation
import CoreData

final class TaskListViewModel: NSObject, ObservableObject {
    @Published private(set) var tasks: [TaskEntity] = []
    @Published var filter: TaskFilter {
        didSet {
            applyFilter()
        }
    }

    private let context: NSManagedObjectContext
    private let fetchedResultsController: NSFetchedResultsController<TaskEntity>
    init(context: NSManagedObjectContext, filter: TaskFilter) {
        self.context = context
        self.filter = filter

        let request: NSFetchRequest<TaskEntity> = TaskEntity.fetchRequest()
        request.sortDescriptors = [
            NSSortDescriptor(keyPath: \TaskEntity.isCompleted, ascending: true),
            NSSortDescriptor(keyPath: \TaskEntity.priorityRawValue, ascending: true),
            NSSortDescriptor(keyPath: \TaskEntity.dueDate, ascending: true)
        ]

        fetchedResultsController = NSFetchedResultsController(fetchRequest: request,
                                                              managedObjectContext: context,
                                                              sectionNameKeyPath: nil,
                                                              cacheName: nil)

        super.init()

        fetchedResultsController.delegate = self
        try? fetchedResultsController.performFetch()
        applyFilter()
    }

    func createTask(draft: TaskDraft) {
        let task = TaskEntity(context: context)
        task.id = draft.id ?? UUID()
        task.createdAt = Date()
        task.update(using: draft)
        save()
        scheduleNotification(for: task)
        applyFilter()
    }

    func update(task: TaskEntity, using draft: TaskDraft) {
        task.update(using: draft)
        save()
        scheduleNotification(for: task)
        applyFilter()
    }

    func toggleCompletion(for task: TaskEntity) {
        task.isCompleted.toggle()
        task.updatedAt = Date()
        if task.isCompleted {
            NotificationService.shared.removeNotification(for: task.id)
        } else {
            scheduleNotification(for: task)
        }
        save()
        applyFilter()
    }

    func delete(_ task: TaskEntity) {
        NotificationService.shared.removeNotification(for: task.id)
        context.delete(task)
        save()
        applyFilter()
    }

    func duplicate(_ task: TaskEntity) {
        var draft = TaskDraft(task: task)
        draft.id = UUID()
        draft.title += " Copy"
        draft.isCompleted = false
        createTask(draft: draft)
    }

    func exportTasks() throws -> URL {
        try BackupManager.shared.exportTasks(tasks: fetchedResultsController.fetchedObjects ?? [])
    }

    func sharePayload(for tasks: [TaskEntity]) -> SharePayload {
        ShareService.shared.payload(for: tasks)
    }

    func setFilter(_ filter: TaskFilter) {
        self.filter = filter
    }

    private func save() {
        context.performAndWait {
            do {
                try context.save()
            } catch {
                context.rollback()
                assertionFailure("Failed to save context: \(error)")
            }
        }
    }

    private func applyFilter() {
        let objects = fetchedResultsController.fetchedObjects ?? []
        tasks = objects.filter { task in
            guard filter.searchText.isEmpty || task.title.localizedCaseInsensitiveContains(filter.searchText) || (task.details?.localizedCaseInsensitiveContains(filter.searchText) ?? false) else {
                return false
            }

            if let priority = filter.priority, task.priority != priority {
                return false
            }

            if !filter.tags.isEmpty && filter.tags.intersection(Set(task.tags)).isEmpty {
                return false
            }

            switch filter.status {
            case .all:
                break
            case .active:
                guard !task.isCompleted else { return false }
            case .completed:
                guard task.isCompleted else { return false }
            }

            if let range = filter.dueDateRange {
                guard let due = task.dueDate, range.contains(due) else { return false }
            }

            return true
        }
    }

    private func scheduleNotification(for task: TaskEntity) {
        guard let dueDate = task.dueDate else { return }
        NotificationService.shared.scheduleNotification(for: task.id,
                                                        title: task.title,
                                                        body: task.details ?? "",
                                                        dueDate: dueDate)
    }
}

extension TaskListViewModel: NSFetchedResultsControllerDelegate {
    func controllerDidChangeContent(_ controller: NSFetchedResultsController<NSFetchRequestResult>) {
        applyFilter()
    }
}
