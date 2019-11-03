# Terms-ToDo
Terms-ToDo is a terminal-based to-do list written in nodejs and distributed using npm. The focus is to have a simple CLI that can store, show, and manage your to-do tasks without the need for a GUI.

## Usage
	terms-todo [options]
When no options are passed, it lists all task lists and tasks
Options:   

	-a, --add: Add a new task
	-n, --new: Create a new tasklist
	-c, --clear: Clear selected tasklists
	-d, --delete: Delete selected tasklist
	-r, --remove: Remove tasks from selected tasklist

## Future Plans
I would like to migrate from the 'arg' package to the 'args' package (Confusing, right?) for managing command-line options and commands. 'arg' is too strict and doesn't allow for auto-documentation, whereas 'args' allows for better command-line interpretation and auto-documentation.

## License
This software is distributed under an MIT license, meaning it is free to edit and distribute. If you edit this software, please link back to and credit this original repository, and show me your changes!

## Contributing
If you would like to contribute, feel free to make a pull request. I will assess all contributions. Reminder, I want this to stay small and fast, so contributions that don't follow that idea will not be accepted.
