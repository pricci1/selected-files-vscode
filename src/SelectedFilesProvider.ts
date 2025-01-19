import * as vscode from 'vscode';

export class FileItem extends vscode.TreeItem {
  constructor(public readonly uri: vscode.Uri) {
    super(uri.fsPath, vscode.TreeItemCollapsibleState.None);

    this.contextValue = 'fileItem';

    this.command = {
      command: 'selectedFiles.showFileInfo',
      title: 'Show File Info',
      arguments: [this]
    };
    this.tooltip = uri.fsPath;
    this.description = 'Something'; // You could put a short string describing the file
  }
}

export class SelectedFilesProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> =
    new vscode.EventEmitter<FileItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> =
    this._onDidChangeTreeData.event;

  // In-memory list of URIs
  private selectedFiles: vscode.Uri[] = [];

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
      return Promise.resolve(
        this.selectedFiles.map(uri => new FileItem(uri))
      );
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
    if (!this.selectedFiles.some(existing => existing.fsPath === uri.fsPath)) {
      this.selectedFiles.push(uri);
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
      if (!this.selectedFiles.some(existing => existing.fsPath === uri.fsPath)) {
        this.selectedFiles.push(uri);
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
    const index = this.selectedFiles.findIndex(f => f.fsPath === uri.fsPath);
    if (index >= 0) {
      this.selectedFiles.splice(index, 1);
      // Persist if desired
      // this.context.globalState.update( ... );
      this.refresh();
    }
  }
}