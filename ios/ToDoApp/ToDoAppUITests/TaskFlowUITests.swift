import XCTest

final class TaskFlowUITests: XCTestCase {
    func testCreateAndCompleteTaskFlow() throws {
        let app = XCUIApplication()
        app.launch()

        app.navigationBars.buttons["Add Task"].tap()

        let titleField = app.textFields["Title"]
        XCTAssertTrue(titleField.waitForExistence(timeout: 2))
        titleField.tap()
        titleField.typeText("Buy groceries")

        app.buttons["Save"].tap()

        let taskCell = app.cells.staticTexts["Buy groceries"]
        XCTAssertTrue(taskCell.waitForExistence(timeout: 2))
        taskCell.tap()

        app.switches["Mark as complete"].tap()
        app.buttons["Save"].tap()

        XCTAssertTrue(app.images["checkmark.circle.fill"].exists)
    }
}
