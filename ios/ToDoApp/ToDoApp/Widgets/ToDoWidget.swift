import WidgetKit
import SwiftUI
import CoreData

struct TaskWidgetEntry: TimelineEntry {
    let date: Date
    let tasks: [TaskSnapshot]

    struct TaskSnapshot: Identifiable {
        let id: UUID
        let title: String
        let dueDate: Date?
        let isCompleted: Bool
    }
}

struct TaskProvider: TimelineProvider {
    func placeholder(in context: Context) -> TaskWidgetEntry {
        TaskWidgetEntry(date: Date(), tasks: [])
    }

    func getSnapshot(in context: Context, completion: @escaping (TaskWidgetEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TaskWidgetEntry>) -> Void) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func loadEntry() -> TaskWidgetEntry {
        let context = PersistenceController.shared.container.viewContext
        let request: NSFetchRequest<TaskEntity> = TaskEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \TaskEntity.dueDate, ascending: true)]
        request.fetchLimit = 5

        let tasks: [TaskWidgetEntry.TaskSnapshot]
        do {
            tasks = try context.fetch(request).map { task in
                TaskWidgetEntry.TaskSnapshot(id: task.id,
                                             title: task.title,
                                             dueDate: task.dueDate,
                                             isCompleted: task.isCompleted)
            }
        } catch {
            tasks = []
        }

        return TaskWidgetEntry(date: Date(), tasks: tasks)
    }
}

struct ToDoWidgetEntryView: View {
    var entry: TaskProvider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(entry.tasks.prefix(3)) { task in
                HStack {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(task.isCompleted ? .green : .secondary)
                    VStack(alignment: .leading) {
                        Text(task.title)
                            .font(.headline)
                            .lineLimit(1)
                        if let dueDate = task.dueDate {
                            Text(dueDate, style: .time)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            Spacer()
            Text("Open To-Do")
                .font(.footnote)
                .foregroundColor(.accentColor)
        }
        .padding()
    }
}

@main
struct ToDoWidget: Widget {
    let kind: String = "ToDoWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TaskProvider()) { entry in
            ToDoWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Upcoming Tasks")
        .description("View your next tasks at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
