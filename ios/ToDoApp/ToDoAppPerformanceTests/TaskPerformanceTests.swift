import XCTest
import CoreData
@testable import ToDoApp

final class TaskPerformanceTests: XCTestCase {
    func testTaskFetchPerformance() throws {
        let persistence = PersistenceController(inMemory: true)
        let context = persistence.container.viewContext
        for index in 0..<1000 {
            let task = TaskEntity(context: context)
            task.id = UUID()
            task.title = "Task \(index)"
            task.createdAt = Date()
            task.updatedAt = Date()
        }
        try context.save()

        measure(metrics: [XCTClockMetric(), XCTMemoryMetric()]) {
            let request: NSFetchRequest<TaskEntity> = TaskEntity.fetchRequest()
            _ = try? context.fetch(request)
        }
    }
}
