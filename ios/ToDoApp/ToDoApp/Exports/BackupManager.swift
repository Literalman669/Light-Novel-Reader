import Foundation
import UniformTypeIdentifiers
import SwiftUI
import UIKit

final class BackupManager {
    static let shared = BackupManager()

    private init() {}

    func exportTasks(tasks: [TaskEntity]) throws -> URL {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601

        let payload = tasks.map { task in
            TaskArchive(id: task.id,
                        title: task.title,
                        details: task.details,
                        dueDate: task.dueDate,
                        priority: task.priority,
                        tags: task.tags,
                        isCompleted: task.isCompleted,
                        createdAt: task.createdAt,
                        updatedAt: task.updatedAt)
        }

        let data = try encoder.encode(payload)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("Tasks-\(Date().ISO8601Format()).json")
        try data.write(to: url)
        return url
    }

    func presentExportSheet(url: URL) {
        let activity = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        activity.excludedActivityTypes = [.assignToContact, .postToFacebook]
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }?
            .rootViewController?
            .present(activity, animated: true)
    }
}

private struct TaskArchive: Codable {
    let id: UUID
    let title: String
    let details: String?
    let dueDate: Date?
    let priority: TaskPriority
    let tags: [String]
    let isCompleted: Bool
    let createdAt: Date
    let updatedAt: Date
}
