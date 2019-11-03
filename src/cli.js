import arg from 'arg';
import inquirer from 'inquirer';

const fs = require('fs');

function parseArgumentsIntoOptions(rawArgs) {
	const args = arg(
		{
			'--clear': Boolean,
			'--add': Boolean,
			'--new': Boolean,
			'--delete': Boolean,
			'-c': '--clear',
			'-a': '--add',
			'-n': '--new',
			'-d': '--delete'
		},
		{
			argv: rawArgs.slice(2),
		}
	);

	return {
		clear: args['--clear'] || false,
		addItem: args['--add'] || false,
		newList: args['--new'] || false,
		deleteList: args['--delete'] || false
	};
}

async function promptForMissingOptions(options, lists) {
	
	const questions = [];

	if(options.clear) {
		questions.push({
			type: 'confirm',
			name: 'clear',
			message: 'Are you sure you want to clear all lists?',
			default: false
		});
	}

	// If the user wants to add an item
	if(options.addItem) {
		// Get the item information
		questions.push({
			type: 'input',
			name: 'newItem',
			message: 'Enter item to add: '
		});
		// Get the list to add it to
		questions.push({
			type: 'list',
			name:'treeForNewItem',
			message: 'Pick a list for this item',
			default: 'Master',
			choices: lists
		});
	}

	// If user wants a new list
	if(options.newList) {
		questions.push({
			type: 'input',
			name: 'newListName',
			message: 'Enter the name for your new list: ',
			validate: function(value) {
				if(value != "")
					return true;
				else
					return false;
			}
		});
	}

	// If user wants to delete one or more lists
	if(options.deleteList){
		let temp = lists;
		temp.shift(); // Remove master without removing it from lists
		questions.push({
			type: 'checkbox',
			name: 'listsToDelete',
			message: 'Select the lists you want to delete: ',
			choices: temp
		});
	}

	const answers = await inquirer.prompt(questions);
	return {
		...options,
		clear: answers.clear,
		newItem: answers.newItem,
		treeForNewItem: answers.treeForNewItem,
		newListName: answers.newListName,
		listsToDelete: answers.listsToDelete
	};
}

export async function cli(args){
    let options = parseArgumentsIntoOptions(args);

    let listNames = [] // Holds all of the users list names
    let data = {}; // Hold the data from the file

    if(fs.existsSync('../public/lists.json')){ // Check if the file exists

    	data = fs.readFileSync('../public/lists.json'); // Read the lists from the file

    	data = JSON.parse(data); // Parse from bytecode to JSON

    	let keys = Object.keys(data); // Only gets top-level keys, which are the names of lists

    	listNames = keys; // Store to show to user in questions
    }
    else {// If it doesn't exist
    	listNames = ["Master"]; // Initialize an empty Master list
	}

    options = await promptForMissingOptions(options, listNames);
    console.log(options);

    fs.writeFileSync('../public/lists.json', data); // Replace file with newest data
}

