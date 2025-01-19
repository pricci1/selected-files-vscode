import * as vscode from "vscode";
import * as path from "path";

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly uri: vscode.Uri,
    public include: boolean = true,
  ) {
    super(path.basename(uri.fsPath), vscode.TreeItemCollapsibleState.None);

    this.contextValue = "fileItem";

    this.command = {
      command: "vscode.open",
      title: "Open file in editor",
      arguments: [this.uri],
    };
    this.tooltip = uri.fsPath;
    this.iconPath = new vscode.ThemeIcon(this.include ? "check" : "circle-large-outline");
  }
}

export class SelectedFilesProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> =
    new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> =
    this._onDidChangeTreeData.event;

  // In-memory list of URIs
  private selectedFiles: { uri: vscode.Uri; include: boolean }[] = [];

  constructor(private context: vscode.ExtensionContext) {
    // Optional: Load persisted data here if you want the list to survive restarts
    // e.g.:
    // const storedPaths = context.globalState.get<string[]>('selectedFiles');
    // if (storedPaths) {
    //   this.selectedFiles = storedPaths.map(path => vscode.Uri.parse(path));
    // }
  }

  // Required by the TreeDataProvider interface:
  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (!element) {
      // Return all items at the root
      return Promise.resolve(this.selectedFiles.map((f) => new FileItem(f.uri, f.include)));
    } else {
      // This example has no nested items
      return Promise.resolve([]);
    }
  }

  /**
   * Refresh the entire tree. This signals to VS Code that the data has changed.
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Add a single file URI to the list (if not already in it).
   */
  addFile(uri: vscode.Uri) {
    if (!this.selectedFiles.some((f) => f.uri.fsPath === uri.fsPath)) {
      this.selectedFiles.push({ uri, include: true });
      // Persist if desired
      // this.context.globalState.update(
      //   'selectedFiles',
      //   this.selectedFiles.map(u => u.toString())
      // );
      this.refresh();
    }
  }

  /**
   * Add multiple file URIs to the list.
   */
  addFiles(uris: vscode.Uri[]) {
    let updated = false;
    for (const uri of uris) {
      if (!this.selectedFiles.some((f) => f.uri.fsPath === uri.fsPath)) {
        this.selectedFiles.push({ uri, include: true });
        updated = true;
      }
    }
    if (updated) {
      // Persist if desired
      // this.context.globalState.update( ... );
      this.refresh();
    }
  }

  /**
   * Remove a file from the list.
   */
  removeFile(uri: vscode.Uri) {
    const index = this.selectedFiles.findIndex((f) => f.uri.fsPath === uri.fsPath);
    if (index >= 0) {
      this.selectedFiles.splice(index, 1);
      // Persist if desired
      // this.context.globalState.update( ... );
      this.refresh();
    }
  }

  public toggleInclude(uri: vscode.Uri) {
    const found = this.selectedFiles.find((f) => f.uri.fsPath === uri.fsPath);
    if (found) {
      found.include = !found.include;
      this.refresh();
    }
  }

  public reverseIncludes(): void {
    for (const file of this.selectedFiles) {
      file.include = !file.include;
    }
    this.refresh();
  }

  getSelectedPaths(): string[] {
    const config = vscode.workspace.getConfiguration("selectedFiles");
    const copyRelativePath = config.get<boolean>("copyRelativePath", true);

    let workspaceFolder: string | undefined;
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    return this.selectedFiles
      .filter((f) => f.include)
      .map((f) => {
        let filePath = f.uri.fsPath;
        if (copyRelativePath && workspaceFolder && filePath.startsWith(workspaceFolder)) {
          filePath = path.relative(workspaceFolder, filePath);
        }
        return filePath.replace(/ /g, "\\ ");
      });
  }
}
