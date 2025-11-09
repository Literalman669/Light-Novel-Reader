import SwiftUI
import CoreData

struct ContentView: View {
    @Environment(\.managedObjectContext) private var context
    @EnvironmentObject private var settings: UserSettings

    var body: some View {
        NavigationStack {
            TaskListView(viewModel: TaskListViewModel(context: context, filter: settings.selectedFilter),
                         filter: $settings.selectedFilter)
                .navigationTitle("Tasks")
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        FilterMenuView(filter: $settings.selectedFilter)
                    }
                    ToolbarItem(placement: .primaryAction) {
                        AddTaskButton(context: context, filter: $settings.selectedFilter)
                    }
                }
        }
    }
}

private struct AddTaskButton: View {
    @Environment(\.managedObjectContext) private var context
    @State private var isPresentingForm = false
    @Binding var filter: TaskFilter

    var body: some View {
        Button {
            isPresentingForm = true
        } label: {
            Label("Add Task", systemImage: "plus")
        }
        .sheet(isPresented: $isPresentingForm) {
            TaskFormView(viewModel: TaskDetailViewModel(context: context, task: nil, preselectedFilter: filter))
        }
    }
}

private struct FilterMenuView: View {
    @Binding var filter: TaskFilter

    var body: some View {
        Menu {
            Picker("Priority", selection: $filter.priority) {
                Text("All").tag(TaskPriority?.none)
                ForEach(TaskPriority.allCases) { priority in
                    Text(priority.localizedTitle).tag(TaskPriority?.some(priority))
                }
            }
            Picker("Status", selection: $filter.status) {
                Text("All").tag(TaskStatusFilter.all)
                Text("Active").tag(TaskStatusFilter.active)
                Text("Completed").tag(TaskStatusFilter.completed)
            }
        } label: {
            Image(systemName: "line.3.horizontal.decrease.circle")
        }
    }
}
