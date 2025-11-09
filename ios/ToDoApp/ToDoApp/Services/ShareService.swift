import Foundation
import SwiftUI
import UIKit

struct SharePayload {
    let text: String
    let metadata: [String: Any]
}

final class ShareService {
    static let shared = ShareService()

    func payload(for tasks: [TaskEntity]) -> SharePayload {
        let formatter = DateFormatter.taskDateFormatter
        let lines = tasks.map { task -> String in
            let due = task.dueDate.map { formatter.string(from: $0) } ?? "No due date"
            let status = task.isCompleted ? "✅" : "⬜️"
            let tags = task.tags.isEmpty ? "" : " [\(task.tags.joined(separator: ", "))]"
            return "\(status) \(task.title) — due \(due)\(tags)"
        }

        return SharePayload(text: lines.joined(separator: "\n"),
                             metadata: ["count": tasks.count])
    }

    func present(payload: SharePayload) {
        let activity = UIActivityViewController(activityItems: [payload.text], applicationActivities: nil)
        activity.excludedActivityTypes = [.assignToContact]
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }?
            .rootViewController?
            .present(activity, animated: true)
    }
}
