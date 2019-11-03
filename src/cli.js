import arg from 'arg';
const chalk = require('chalk');
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
		deleteList: args['--delete'] || false,
		noOptions: !(args['--clear'] || args['--add'] || args['--new'] || args['--delete'])
	};
}

async function promptForMissingOptions(options, lists) {
	
	const questions = [];

	if(options.clear) {
		questions.push({
			type: 'checkbox',
			name: 'listsToClear',
			message: 'Select the lists you want to clear:',
			choices: lists
		});

		questions.push({
			type: 'confirm',
			name: 'clearLists',
			message: 'Are you sure you want to clear these lists?',
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
			name:'listForNewItem',
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
		clearLists: answers.clearLists,
		listsToClear: answers.listsToClear,
		newItem: answers.newItem,
		listForNewItem: answers.listForNewItem,
		newListName: answers.newListName,
		listsToDelete: answers.listsToDelete
	};
}

function handleAnswers(answers, data) {
	let successes = {};
	if(answers.clear) {
		for(var i = 0; i < answers.listsToClear.length; i++) {
			data[answers.listsToClear[i]].items = [];
		}

		successes.clear = true;
	}

	if(answers.addItem) {
		data[answers.listForNewItem].items.push(answers.newItem);
		successes.addItem = true;
	}

	if(answers.newList) {
		data[answers.newListName] = {"items": []};
		successes.newList = true;
	}

	return successes;
}

function showSuccesses(successes, options) {
	if(options.clear) {
		if(successes.clear) {
			console.log("Lists have been " + chalk.green("successfully") + " cleared!");
		} else {
			console.log(chalk.red("Failed") + " to clear lists.");
		}
	}

	if(options.addItem) {
		if(successes.addItem){
			console.log("Item \"" + options.newItem + "\" has been " + 
				chalk.green("successfully") + " added to list \"" + options.listForNewItem + "\"!" );
		} else {
			console.log(chalk.red("Failed") + " to add item \"" + options.newItem + "\" to list \"" + options.listForNewItem + "\".");
		}
	}

	if(options.newList) {
		if(successes.newList) {
			console.log("New list \"" + options.newListName + "\" has been " + chalk.green("successfully") + " created!");
		} else {
			console.log(chalk.red("Failed") + "to create new list \"" + options.newListName + "\".");
		}
	}
}

function showTasks(data, keys) {
	for(var i = 0; i < keys.length; i++) {
		console.log(chalk.blue(keys[i]));
		for(var j = 0; j < data[keys[i]].items.length; j++) {
			console.log("	" + data[keys[i]].items[j]);
		}
	}
}

export async function cli(args){
    let options = parseArgumentsIntoOptions(args);

    let listNames = [] // Holds all of the users list names
    let data = {}; // Hold the data from the file

    if(fs.existsSync('./public/lists.json')){ // Check if the file exists

    	data = fs.readFileSync('./public/lists.json'); // Read the lists from the file

    	data = JSON.parse(data); // Parse from bytecode to JSON

    	let keys = Object.keys(data); // Only gets top-level keys, which are the names of lists

    	listNames = keys; // Store to show to user in questions
    }
    else {// If it doesn't exist
    	listNames = ["Master"]; // Initialize an empty Master list
    	data = {
    		"Master": {
    			"items": []
    		}
    	}
	}

	if(options.noOptions) {
		showTasks(data, listNames);
	} else {
		options = await promptForMissingOptions(options, listNames);
	    console.log(options);

	    let successes = handleAnswers(options, data);
	    showSuccesses(successes, options);
	}

    fs.writeFileSync('./public/lists.json', JSON.stringify(data)); // Replace file with newest data
}

