const vscode = require('vscode');

function activate(context) {

	const provider = new CustomFoldingProvider();
	context.subscriptions.push(
			vscode.languages.registerFoldingRangeProvider('*', provider)
	);

	console.log('Activating Custom Folding Provider...');

	// Add the configuration change listener
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('customFolding.enableInstantCollapse')) {
					// Here you can re-instantiate the provider or modify its behavior if needed
					console.log('Instant collapse configuration changed.');
					// If you want to update the existing provider or behavior, you might need to manage that here.
			}
	}));

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('customFolding.enableNormalCollapse') ||
				event.affectsConfiguration('customFolding.enableAllFeatures') ||
				event.affectsConfiguration('customFolding.enableInstantCollapse')) {
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

	
}







function deactivate() {}

module.exports = {
    activate,
    deactivate
};
