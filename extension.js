const vscode = require('vscode');

// function activate(context) {

// 	const provider = new CustomFoldingProvider();
// 	context.subscriptions.push(
// 			vscode.languages.registerFoldingRangeProvider('*', provider)
// 	);

// 	console.log('Activating Custom Folding Provider...');

// 	// Add the configuration change listener
// 	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
// 			if (event.affectsConfiguration('customFolding.enableInstantCollapse')) {
// 					// Here you can re-instantiate the provider or modify its behavior if needed
// 					console.log('Instant collapse configuration changed.');
// 					// If you want to update the existing provider or behavior, you might need to manage that here.
// 			}
// 	}));

// 	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
// 		if (event.affectsConfiguration('customFolding.enableNormalCollapse') ||
// 				event.affectsConfiguration('customFolding.enableAllFeatures') ||
// 				event.affectsConfiguration('customFolding.enableInstantCollapse')) {
// 					vscode.window.showInformationMessage(
// 						'Configuration for custom folding has changed. Please reload the window for changes to take effect.',
// 						'Reload'
// 				).then(selected => {
// 						if (selected === 'Reload') {
// 								vscode.commands.executeCommand('workbench.action.reloadWindow');
// 						}
// 				});
// 		}
// }));
// }


function activate(context) {
  const provider = new CustomFoldingProvider();

  // Register the custom folding provider
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider('*', provider)
  );

  console.log('Activating Custom Folding Provider...');

 // Register the single toggle command
 context.subscriptions.push(
	vscode.commands.registerCommand('extension.toggleCustomFolding', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const selection = editor.selection;
		const foldingRanges = provider.provideFoldingRanges(editor.document);
		if (!foldingRanges || foldingRanges.length === 0) return;

		const selectedRanges = foldingRanges.filter(range =>
			!selection.isEmpty
				? range.start >= selection.start.line && range.end <= selection.end.line
				: true
		);

		// Check if the first range in selectedRanges is already folded or not
		const firstRange = selectedRanges[0];
		const isFirstRangeFolded = editor.visibleRanges.every(visibleRange =>
			visibleRange.end.line < firstRange.start || visibleRange.start.line > firstRange.end
		);

		// Toggle folding based on whether the first range is currently folded or not
		for (const range of selectedRanges) {
			editor.selection = new vscode.Selection(range.start, 0, range.start, 0);
			await vscode.commands.executeCommand(isFirstRangeFolded ? 'editor.unfold' : 'editor.fold');
		}
	})
);

  // Configuration change listeners
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('customFolding.enableInstantCollapse') ||
        event.affectsConfiguration('customFolding.enableNormalCollapse') ||
        event.affectsConfiguration('customFolding.enableAllFeatures')) {
      vscode.window.showInformationMessage(
        'Configuration for custom folding has changed. Please reload the window for changes to take effect.',
        'Reload'
      ).then(selected => {
        if (selected === 'Reload') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });
    }
  }));
}


class CustomFoldingProvider {

	provideFoldingRanges(document, _token) {
			console.log('provideFoldingRanges called for document:', document.fileName);

			const config = vscode.workspace.getConfiguration('customFolding');
			const enableAllFeatures = config.get('enableAllFeatures', true);
			const enableNormalCollapse = config.get('enableNormalCollapse', true);
			const enableInstantCollapse = config.get('enableInstantCollapse', true);
			const startMarker = config.get('startFoldingMarker', '// <');
			const endMarker = config.get('endFoldingMarker', '// >');
			const instantCollapseMarker = config.get('instantCollapseMarker', '// >>');

			console.log('Using start marker:', startMarker);
			console.log('Using end marker:', endMarker);
			console.log('Using instant collapse marker:', instantCollapseMarker);
			const foldingRanges = [];
			const text = document.getText();
			const lines = text.split('\n');
			const normalCollapseStack = []; // normalCollapseStack to keep track of start positions
			const instantCollapseStack = []; // instantCollapseStack to keep track of start positions
			let instantShouldCollapse = true
			let normalShouldCollapse = true
			let length = null

			if(!enableAllFeatures) {
				return []
			}

			for (let i = 0; i < lines.length; i++) {
					const line = lines[i].trim();

					// // Check for start markers
				if(enableNormalCollapse){
					if (line.startsWith(startMarker) && normalShouldCollapse) {
						normalCollapseStack.push(i); // Push the start position onto the normalCollapseStack
						instantShouldCollapse = false
						normalShouldCollapse = true
					} 
					// Check for end markers
					else if (line.startsWith(endMarker) && normalCollapseStack.length > 0 && normalShouldCollapse) {
							const start = normalCollapseStack.pop(); // Pop the last start position
							foldingRanges.push(new vscode.FoldingRange(start, i )); // Create a folding range
							instantShouldCollapse = normalCollapseStack.length > 0 ? instantShouldCollapse : true
							--length
					}
				} 

				if(enableInstantCollapse) {
					// Check for instant collapse markers
					if (line.startsWith(instantCollapseMarker)) {
						instantCollapseStack.push(i)
						instantShouldCollapse =  true
						length = normalCollapseStack.length
						
					} else if(line.trim() === '' && instantCollapseStack.length > 0 && instantShouldCollapse && normalCollapseStack.length === length) {
							foldingRanges.push(new vscode.FoldingRange(instantCollapseStack.pop(), i - 1 ))
					
							instantShouldCollapse = normalCollapseStack.length > 0 ? false : true
							
					}

				}

				if(line.indexOf('}') > line.indexOf('{')){
					instantShouldCollapse = true
					normalShouldCollapse = true
				}
				else if(line.indexOf('{') > line.indexOf('}')){
					instantShouldCollapse = false
					normalShouldCollapse = false
				}

					

			}

			console.log('Folding ranges:', foldingRanges);
			return foldingRanges;
	}

	getFoldingRangesBetweenLines(startLine, endLine) {
    // Implement logic to return folding ranges based on the start and end line
    const ranges = [];
    // Example logic: fold every line in the selected range (adjust this as needed)
    for (let i = startLine; i <= endLine; i++) {
      // Add your folding criteria here
      ranges.push(new vscode.FoldingRange(i, i + 1)); // Example: fold the line and the next one
    }
    return ranges;
  }

	
}







function deactivate() {}

module.exports = {
    activate,
    deactivate
};
