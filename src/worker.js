'use strict';

// Returns the intersection of the codes accepted by the criteria from 0 to index, or null if the last is incompatible
const currentAccepted = (criteria, solution, index) => {
	const a = criteria[solution[index].index];
	for (let i = 0; i < index; i += 1) {
		const b = criteria[solution[i].index];
		// Assume a.id != b.id; a.compatible[b] is defined if and only if a.id > b.id
		if (!(a.id > b.id ? a.compatible[b.id] : b.compatible[a.id])) {
			return null;
		}
	}
	const {accepted} = solution[index - 1];
	const result = accepted.filter(c => a.accepts[c]);
	// If result.length >= accepted.length, this criterion is redundant
	// If result.length <= solution.length - 1 - index, there are not enough accepted to find a solution
	return result.length < accepted.length && result.length > solution.length - 1 - index ? result : null;
};

// Checks whether a criterion rejects at least a code accepted by every other criteria
const isRedundant = (criteria, solution, index) => {
	for (const code of criteria[solution[index].index].rejected) {
		let i = 0;
		while (i < solution.length && (index === i || criteria[solution[i].index].accepts[code])) {
			i += 1;
		}
		if (i === solution.length) {
			return false;
		}
	}
	return true;
};

// Checks whether at least one criterion is redundant; the last one is assumed to be already checked
const isAnyRedundant = (criteria, solution) => {
	for (let i = 0; i < solution.length - 1; i += 1) {
		if (isRedundant(criteria, solution, i)) {
			return true;
		}
	}
	return false;
};

// Returns the next index; can mutate solution
const nextIndex = (criteria, solution, index) => {
	// If this criterion is ok and not the last, move right
	if (solution[index].accepted && index < solution.length - 1) {
		solution[index + 1].index = solution[index].index + 1;
		return index + 1;
	}
	// Increment solution[i].index or move left if it is not possible
	for (let i = index; i > 0; i -= 1) {
		// If there are enough remaining criteria to assign one to the following positions
		if (solution[i].index + solution.length - i < criteria) {
			solution[i].index += 1;
			return i;
		}
	}
	return 0;
};

// Generates an enigma using backtracking; the first criterion is chosen by the caller
onmessage = message => {
	const {criteria, length, first} = message.data;
	// If length === 1, the enigma is valid if and only if criteria[first] accepts exactly one code
	if (length === 1) {
		return postMessage(criteria[first].accepted.length === 1 ? {
			criteria: [criteria[first]],
			solution: criteria[first].accepted[0],
		} : null);
	}
	// In solution[i].accepted there are the codes accepted by every criterion from 0 to i included
	// In solution[i].index there is the criterion used
	const solution = Array.from({length}, (_, i) => i ? {} : {
		accepted: criteria[first].accepted,
		index: first,
	});
	for (let i = nextIndex(criteria.length, solution, 0); i; i = nextIndex(criteria.length, solution, i)) {
		solution[i].accepted = currentAccepted(criteria, solution, i);
		if (i === length - 1 && solution[i].accepted?.length === 1 && !isAnyRedundant(criteria, solution)) {
			return postMessage({
				criteria: solution.map(s => criteria[s.index]).sort((a, b) => a.id - b.id),
				solution: solution[length - 1].accepted,
			});
		}
	}
	// There are no enigmas with requested arguments
	return postMessage(null);
};

const functions = [
	currentAccepted,
	isRedundant,
	isAnyRedundant,
	nextIndex,
];

// Used to make the worker work locally
/* exported workerString */
const workerString = `'use strict';${functions.map(f => `const ${f.name}=${f};`).join('')}onmessage=${onmessage}`;
