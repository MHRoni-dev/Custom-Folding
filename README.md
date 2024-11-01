# Custom Folding Extension

A custom folding extension for Visual Studio Code that offers enhanced control over code folding with features like instant collapsing and customizable fold markers.

## Features

### 1. Normal Collapse
- Collapses code sections marked by user-defined `startFoldingMarker` and `endFoldingMarker`.
- Enabled by default, this feature allows code folding for specified markers, making it easier to manage sections in large files.
- Customizable through the settings.

### 2. Instant Collapse
- Collapses code from the `instantCollapseMarker` to the next empty line.
- If a normal collapse section is encountered before an empty line, it will include the normal collapse within the instant collapse.
- Configurable via settings to turn on/off as needed.

### 3. Toggleable Settings
- **Enable Normal Collapse**: Allows you to turn on or off the normal collapse feature without reloading.
- **Enable Instant Collapse**: Instantly toggle the instant collapse feature.
- **Enable All Features**: A master setting to enable or disable all custom folding features.

### 4. Transparent Color Coding (Optional)
- Each folding section (start and end lines) can be colorized with a transparent color to visually distinguish different code blocks.
- Random colors are assigned to pairs of markers to maintain clarity in the code structure.
- Adjust the transparency so that text remains clearly visible.

## Extension Settings

This extension contributes the following settings:

- `customFolding.startFoldingMarker`: Specifies the marker to begin a normal collapse section (default: `// <`).
- `customFolding.endFoldingMarker`: Specifies the marker to end a normal collapse section (default: `// >`).
- `customFolding.instantCollapseMarker`: Defines the marker for instant collapse (default: `// >>`).
- `customFolding.enableNormalCollapse`: Enables/disables the normal collapse feature.
- `customFolding.enableInstantCollapse`: Enables/disables the instant collapse feature.
- `customFolding.enableAllFeatures`: A master toggle to turn on/off all custom folding features.

## Usage

1. Add the start and end markers in your code where you want collapsible sections.
2. Adjust the settings in your VS Code settings to customize the markers and enable/disable features.
3. The extension will automatically apply folding and color coding based on your settings.

## Installation

1. Download the extension from the [Visual Studio Code Marketplace](#).
2. Open VS Code and go to Extensions (Ctrl+Shift+X).
3. Search for "Custom Folding Extension" and click "Install."

## Contributing

Feel free to open issues and submit pull requests to improve this extension.

## License

[MIT](LICENSE)
