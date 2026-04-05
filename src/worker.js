'use strict';

// Generates an enigma using backtracking; the first criterion is chosen by the caller
onmessage = message => {
	const {criteria, length, first} = message.data;
	// If length === 1, the enigma is valid if and only if criteria[first] accepts exactly one code
	if (length === 1) {
		postMessage(criteria[first].accepted.length == 1 ? {
			criteria: [criteria[first]],
			solution: criteria[first].accepted[0],
		} : null);
		return;
	}
	// If there are enough criteria left and codes accepted to make it possible to find a solution
	if (first + length < criteria.length && criteria[first].accepted.length > length - 1) {
		// Indexes of the criteria used; -1 means none yet; always sorted except for -1
		const indexes = Array.from({length}, (_, i) => i ? -1 : first);
		// Checks whether the criterion at index is compatible with the criteria before
		const isCompatible = index => {
			const a = criteria[indexes[index]];
			for (let i = 0; i < index; ++i) {
				const b = criteria[indexes[i]];
				// a.id != b.id; a.compatible[b] is defined if and only if a.id > b.id
				if (!(a.id > b.id ? a.compatible[b.id] : b.compatible[a.id])) {
					return false;
				}
			}
			return true;
		};
		// Checks wheter a criterion rejects at least a code accepted by every other criteria
		const isRedundant = (index) => {
			for (const code of criteria[indexes[index]].rejected) {
				let i = 0;
				for (; i < indexes.length && (index == i || criteria[indexes[i]].accepts[code]); ++i);
				if (i == indexes.length) {
					return false;
				}
			}
			return true;
		};
		// Checks whether at least one criterion is redundant; the last one is assumed to be already checked
		const isAnyRedundant = () => {
			for (let i = 0; i < indexes.length - 1; ++i) {
				if (isRedundant(i)) {
					return true;
				}
			}
			return false;
		};
		// accepted[i] are the codes accepted by the criteria from indexes[0] to indexes[i] included
		const accepted = Array.from({length});
		accepted[0] = criteria[first].accepted;
		for (let position = 1; position; ) {
			let backtrack = false;
			// Find a compatible criterion in position, if it exists
			do {
				// If indexes[position] is blank
				if (indexes[position] === -1) {
					indexes[position] = indexes[position - 1] + 1;
				// If there are criteria available for this position and the ones to the right
				} else if (indexes[position] + length - position < criteria.length) {
					++indexes[position];
				} else {
					// There are no compatible criteria in this position
					backtrack = true;
					indexes[position] = -1;
					position -= 1;
				}
			} while (!backtrack && !isCompatible(position));
			if (!backtrack) {
				accepted[position] = [];
				{
					// Push the codes in the intersection of a1 and a2 into accepted[position]
					const a1 = accepted[position - 1];
					const a2 = criteria[indexes[position]].accepted;
					let i1 = 0;
					let i2 = 0;
					while (i1 < a1.length && i2 < a2.length) {
						if (a1[i1] < a2[i2]) {
							i1 += 1;
						} else {
							if (a1[i1] == a2[i2]) {
								accepted[position].push(a1[i1]);
								i1 += 1;
							}
							i2 += 1;
						}
					}
				}
				// If this criterion is not redundant
				if (accepted[position].length < accepted[position - 1].length) {
					// If there are still blanks
					if (position < length - 1) {
						// If there is at least one possible solution
						if (accepted[position].length > length - 1 - position) {
							++position;
						}
					// If there is a unique solution
					} else if (accepted[length - 1].length === 1) {
						// If each criterion rejects at least a code accepted by every other
						if (!isAnyRedundant()) {
							for (let i = 0; i < indexes.length; ++i) {
								indexes[i] = criteria[indexes[i]];
							}
							postMessage({
								criteria: indexes.sort((a, b) => a.id - b.id),
								solution: accepted[length - 1][0],
							});
							return;
						}
					}
				}
			}
		}
	}
	// There are no enigmas with requested arguments
	postMessage(null);
};
