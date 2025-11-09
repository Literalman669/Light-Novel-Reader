import XCTest
import CoreData
@testable import ToDoApp

final class TaskViewModelTests: XCTestCase {
    var persistence: PersistenceController!
    var context: NSManagedObjectContext!

    override func setUpWithError() throws {
        persistence = PersistenceController(inMemory: true)
        context = persistence.container.viewContext
    }

    override func tearDownWithError() throws {
        persistence = nil
        context = nil
    }

    func testCreateTask() throws {
        let viewModel = TaskListViewModel(context: context, filter: .init())
        let draft = TaskDraft()
        viewModel.createTask(draft: draft)
        XCTAssertEqual(viewModel.tasks.count, 1)
    }

    func testFilterByPriority() throws {
        let viewModel = TaskListViewModel(context: context, filter: .init())
        var draft = TaskDraft()
        draft.title = "High"
        draft.priority = .high
        viewModel.createTask(draft: draft)
        draft.title = "Low"
        draft.priority = .low
        viewModel.createTask(draft: draft)

        var filter = TaskFilter()
        filter.priority = .high
        viewModel.setFilter(filter)
        XCTAssertEqual(viewModel.tasks.count, 1)
        XCTAssertEqual(viewModel.tasks.first?.priority, .high)
    }
}
