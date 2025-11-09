import SwiftUI

struct TaskListView: View {
    @StateObject private var viewModel: TaskListViewModel
    @Binding private var filter: TaskFilter
    @State private var searchText: String = ""
    @State private var selectedTask: TaskEntity?
    @State private var isPresentingForm = false
    @Environment(\.managedObjectContext) private var context

    init(viewModel: TaskListViewModel, filter: Binding<TaskFilter>) {
        _viewModel = StateObject(wrappedValue: viewModel)
        _filter = filter
    }

    var body: some View {
        List {
            if viewModel.tasks.isEmpty {
                EmptyStateView()
            } else {
                ForEach(viewModel.tasks) { task in
                    TaskRowView(task: task) {
                        selectedTask = task
                        isPresentingForm = true
                    } onToggle: {
                        viewModel.toggleCompletion(for: task)
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                        Button(role: .destructive) {
                            viewModel.delete(task)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                        Button {
                            viewModel.duplicate(task)
                        } label: {
                            Label("Duplicate", systemImage: "plus.square.on.square")
                        }
                    }
                }
            }
        }
        .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
        .onChange(of: searchText) { newValue in
            filter.searchText = newValue
            viewModel.setFilter(filter)
        }
        .onAppear {
            viewModel.setFilter(filter)
        }
        .onChange(of: filter) { newFilter in
            viewModel.setFilter(newFilter)
        }
        .sheet(isPresented: $isPresentingForm) {
            if let selectedTask {
                TaskFormView(viewModel: TaskDetailViewModel(context: context, task: selectedTask))
            }
        }
        .toolbar {
            ToolbarItem(placement: .bottomBar) {
                Button {
                    presentShareSheet()
                } label: {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
                .disabled(viewModel.tasks.isEmpty)
            }
            ToolbarItem(placement: .bottomBar) {
                Button {
                    do {
                        let url = try viewModel.exportTasks()
                        BackupManager.shared.presentExportSheet(url: url)
                    } catch {
                        assertionFailure("Backup failed: \(error)")
                    }
                } label: {
                    Label("Export", systemImage: "tray.and.arrow.up")
                }
                .disabled(viewModel.tasks.isEmpty)
            }
        }
    }

    private func presentShareSheet() {
        let payload = viewModel.sharePayload(for: viewModel.tasks)
        ShareService.shared.present(payload: payload)
    }
}

private struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 64))
                .foregroundStyle(.secondary)
            Text("You're all caught up!")
                .font(.title2)
            Text("Create a task to get started.")
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 320)
    }
}
