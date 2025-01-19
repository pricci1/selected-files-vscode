# Selected Files VSCode Extension

## Overview

The Selected Files extension for Visual Studio Code allows you to select files from your workspace and perform various actions on them. With this extension, you can:

- Add the current file, all visible files, or all files from the active editor group to a list of selected files.
- View and manage your selected files in a dedicated sidebar.
- Remove files from your selection as needed.
- Copy the paths of all selected files to your clipboard with a customizable separator.

## Features

- **Add Current File**: Quickly add the file you're currently working on to your selection.
- **Add All Visible Files**: Add all files that are open and visible in your editor windows.
- **Add Active Group's Files**: Add all files from the active editor group (useful if you organize files by tabs).
- **View Selected Files**: A sidebar view displays all your selected files for easy access and management.
- **Remove Files**: Remove files from your selection directly from the sidebar.
- **Copy File Paths**: Copy the file paths of all selected files to your clipboard, with an option to customize the separator.

## Configuration

Setting:

- `selectedFiles.pathSeparator`

  - Type: string
  - Default: " "
  - Description: Character(s) used to separate paths when copying.

- `selectedFiles.copyRelativePath`
  - Type: boolean
  - Default: true
  - Description: When true, copied paths will be relative to the workspace root. Otherwise, absolute paths will be used.
