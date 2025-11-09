import Foundation

enum TaskPriority: String, CaseIterable, Identifiable, Codable {
    case high
    case medium
    case low

    var id: String { rawValue }

    var localizedTitle: String {
        switch self {
        case .high: return "High"
        case .medium: return "Medium"
        case .low: return "Low"
        }
    }

    var sortIndex: Int {
        switch self {
        case .high: return 0
        case .medium: return 1
        case .low: return 2
        }
    }
}

enum TaskStatusFilter: String, CaseIterable, Identifiable, Codable {
    case all
    case active
    case completed

    var id: String { rawValue }
}

struct TaskFilter: Codable, Equatable {
    var searchText: String = ""
    var priority: TaskPriority? = nil
    var tags: Set<String> = []
    var status: TaskStatusFilter = .all
    var dueDateRange: ClosedRange<Date>? = nil

    static let recentRange: ClosedRange<Date> = {
        let start = Calendar.current.startOfDay(for: Date())
        let end = Calendar.current.date(byAdding: .day, value: 7, to: start) ?? Date()
        return start...end
    }()
}
