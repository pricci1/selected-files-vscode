import * as vscode from "vscode";
import { SelectedFilesProvider, FileItem } from "./SelectedFilesProvider";

export function activate(context: vscode.ExtensionContext) {
  // Create our tree data provider
  const selectedFilesProvider = new SelectedFilesProvider(context);

  // Register it with VS Code. The 'selectedFilesView' ID matches package.json
  vscode.window.registerTreeDataProvider("selectedFilesView", selectedFilesProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("selectedFiles.addCurrentFile", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        selectedFilesProvider.addFile(editor.document.uri);
      } else {
        vscode.window.showInformationMessage("No active editor to add.");
      }
    }),

    vscode.commands.registerCommand("selectedFiles.toggleInclude", (fileItem: FileItem) => {
      selectedFilesProvider.toggleInclude(fileItem.uri);
    }),

    vscode.commands.registerCommand("selectedFiles.addCurrentWindowFiles", () => {
      const uris = vscode.window.visibleTextEditors.map((ed) => ed.document.uri);
      if (uris.length === 0) {
        vscode.window.showInformationMessage("No visible editors to add.");
      } else {
        selectedFilesProvider.addFiles(uris);
      }
    }),

    vscode.commands.registerCommand("selectedFiles.addCurrentEditorGroupFiles", () => {
      const activeGroup = vscode.window.tabGroups.activeTabGroup;
      if (!activeGroup) {
        vscode.window.showInformationMessage("No active editor group.");
        return;
      }
      // For each tab in the active group, extract its URI if it's a text editor
      const uris: vscode.Uri[] = [];
      for (const tab of activeGroup.tabs) {
        // The Tab.input type can vary, we check if it's a text-based input
        if (tab.input && (tab.input as any).uri instanceof vscode.Uri) {
          uris.push((tab.input as any).uri);
        }
      }
      if (uris.length > 0) {
        selectedFilesProvider.addFiles(uris);
      } else {
        vscode.window.showInformationMessage("No files found in the active editor group.");
      }
    }),

    vscode.commands.registerCommand("selectedFiles.removeFile", (fileItem: FileItem) => {
      selectedFilesProvider.removeFile(fileItem.uri);
    }),

    vscode.commands.registerCommand("selectedFiles.copyPaths", () => {
      const paths = selectedFilesProvider.getSelectedPaths();
      if (paths.length > 0) {
        const separator = vscode.workspace
          .getConfiguration("selectedFiles")
          .get("pathSeparator", " ");
        vscode.env.clipboard.writeText(paths.join(separator ?? " "));
        vscode.window.showInformationMessage("File paths copied to clipboard!");
      } else {
        vscode.window.showInformationMessage("No files selected to copy.");
      }
    }),

    vscode.commands.registerCommand("selectedFiles.reverseIncluded", () => {
      selectedFilesProvider.reverseIncludes();
    }),
  );
}

export function deactivate() {
  // Clean up if needed
}
