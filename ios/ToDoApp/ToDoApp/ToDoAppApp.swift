import SwiftUI
import CoreData
import WidgetKit

@main
struct ToDoAppApp: App {
    let persistenceController = PersistenceController.shared
    @Environment(\.scenePhase) private var scenePhase

    init() {
        NotificationService.shared.registerForPushNotifications()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(UserSettings())
                .onReceive(NotificationCenter.default.publisher(for: .tasksDidSync)) { _ in
                    WidgetCenter.shared.reloadAllTimelines()
                }
        }
        .onChange(of: scenePhase) { newPhase in
            switch newPhase {
            case .background:
                persistenceController.save()
                WidgetCenter.shared.reloadAllTimelines()
            default:
                break
            }
        }
    }
}

final class UserSettings: ObservableObject {
    @Published var selectedFilter: TaskFilter = .init()
}
