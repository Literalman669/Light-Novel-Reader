import SwiftUI

struct TaskFormView: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var viewModel: TaskDetailViewModel
    @FocusState private var focusedField: Field?

    enum Field {
        case title
        case details
    }

    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Task")) {
                    TextField("Title", text: $viewModel.draft.title)
                        .focused($focusedField, equals: .title)
                    TextField("Details", text: Binding($viewModel.draft.details, replacingNilWith: ""), axis: .vertical)
                        .focused($focusedField, equals: .details)
                        .lineLimit(3...6)
                }

                Section(header: Text("Due Date")) {
                    Toggle(isOn: $viewModel.reminderEnabled.animation()) {
                        Label("Enable Reminder", systemImage: "bell")
                    }
                    if viewModel.reminderEnabled {
                        DatePicker("Due", selection: Binding($viewModel.draft.dueDate, defaultValue: Date()), displayedComponents: [.date, .hourAndMinute])
                            .datePickerStyle(.graphical)
                    }
                }

                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $viewModel.draft.priority) {
                        ForEach(TaskPriority.allCases) { priority in
                            Text(priority.localizedTitle).tag(priority)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section(header: Text("Tags")) {
                    TagEditor(tags: $viewModel.draft.tags)
                }

                Section(header: Text("Status")) {
                    Toggle("Mark as complete", isOn: $viewModel.draft.isCompleted)
                }
            }
            .navigationTitle(viewModel.isNewTask ? "New Task" : "Edit Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(viewModel.draft.title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear {
                focusedField = .title
            }
        }
    }

    private func save() {
        do {
            try viewModel.save()
            dismiss()
        } catch {
            assertionFailure("Failed to save task: \(error)")
        }
    }
}

private struct TagEditor: View {
    @Binding var tags: [String]
    @State private var newTag: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(tags, id: \.self) { tag in
                        HStack(spacing: 4) {
                            Text(tag)
                            Button(role: .destructive) {
                                tags.removeAll { $0 == tag }
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(Color.secondary.opacity(0.2)))
                    }
                }
            }

            HStack {
                TextField("Add tag", text: $newTag)
                Button("Add") {
                    let trimmed = newTag.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !trimmed.isEmpty else { return }
                    if !tags.contains(trimmed) {
                        tags.append(trimmed)
                    }
                    newTag = ""
                }
                .disabled(newTag.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }
}

private extension Binding where Value == String? {
    init(_ source: Binding<String?>, replacingNilWith defaultValue: String) {
        self.init(get: { source.wrappedValue ?? defaultValue }, set: { newValue in
            source.wrappedValue = newValue.isEmpty ? nil : newValue
        })
    }
}

private extension Binding where Value == Date? {
    init(_ source: Binding<Date?>, defaultValue: Date) {
        self.init(get: { source.wrappedValue ?? defaultValue }, set: { newValue in
            source.wrappedValue = newValue
        })
    }
}
