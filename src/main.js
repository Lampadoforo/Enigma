'use strict';

// Create a new array of specified length; optionally populates it using a function taking the index as a parameter
const newArray = (length, func) => Array.from({length}, func && ((_, i) => func(i)));

// Apply a function to each element of the array and put the result in place of the element
const mapInPlace = (array, func) => {
	for (let i = 0; i < array.length; i += 1) {
		array[i] = func(array[i], i);
	}
	return array;
};

// A round of encryption; see An Enciphering Scheme Based on a Card Shuffle (2012) by Hoang, Morris, and Rogaway
const swapOrNot = (x, keys, max) => {
	const xp = keys[0] & max ^ x;
	let lx = keys[1] & (x > xp ? x : xp);
	let result = 0n;
	while (lx) {
		result ^= lx & 1n;
		lx >>= 1n;
	}
	return result ? xp : x;
};

// Add classes to an HTML element
const addClasses = (element, ...classes) => {
	element.classList.add(...classes);
	return element;
};

// Create an HTML element with chosen tag and optionally inner HTML
const create = (tag, html) => {
	const element = document.createElement(tag);
	if (html) {
		element.innerHTML = html;
	}
	return element;
};

// Insert HTML elements into an HTML element
const append = (element, ...elements) => {
	element.append(...elements);
	return element;
};

// Write a digit
const writeDigit = (digit, variable) => `<span class="${variable}">${digit}</span>`;

// Write a code
const writeCode = code => `${writeDigit(code[0], 'x')}${writeDigit(code[1], 'y')}${writeDigit(code[2], 'z')}`;

// Add listeners for click and, optionally, contextmenu; contextmenu is activated by right click or long touch
const onClick = (element, left, right) => {
	element.onclick = left;
	if (right) {
		element.oncontextmenu = right;
	}
	return element;
};

// Show an element by removing the 'hidden' class; optionally add an animation
const show = (element, animation) => {
	if (animation) {
		addClasses(element, animation);
	}
	element.classList.remove('hidden');
	return element;
};

// Hide an element by adding the 'hidden' class
const hide = element => addClasses(element, 'hidden');

// Toggle 'deleted' on element; if only one is not deleted, apply 'guess'; return the color of the container
const toggle = (element, array) => {
	element.classList.toggle('deleted');
	let guess = null;
	for (const e of array) {
		if (!e.classList.contains('deleted')) {
			e.classList.remove('guess');
			// If there are two non-deleted elements, no other has the 'guess' class
			if (guess) {
				return 0;
			}
			guess = e;
		}
	}
	if (guess) {
		addClasses(guess, 'guess');
		return 1;
	}
	return -1;
};

// Apply 'guess' to element; remove it from others and apply 'deleted' to them; return the color of the container
const choose = (element, array) => {
	// If it was already the guess, remove both 'guess' and 'deleted' from all elements
	if (element.classList.contains('guess')) {
		element.classList.remove('guess');
		for (const e of array) {
			e.classList.remove('deleted');
		}
		return 0;
	}
	// Also apply wrong classes to element, but correct it after the loop
	for (const e of array) {
		e.classList.remove('guess');
		addClasses(e, 'deleted');
	}
	element.classList.remove('deleted');
	addClasses(element, 'guess');
	return 1;
};

// Apply color to an element; -1 is red, 0 is white, 1 is green; optionally flashes it; return n === 1
const color = (element, n, flash) => {
	switch (n) {
		case -1:
			element.classList.remove('green');
			addClasses(element, 'red');
			if (flash) {
				addClasses(element, 'flashes_red');
			}
			return false;
		case 0:
			element.classList.remove('green', 'red');
			if (flash) {
				addClasses(element, 'flashes');
			}
			return false;
		case 1:
			element.classList.remove('red');
			addClasses(element, 'green');
			if (flash) {
				addClasses(element, 'flashes_green');
			}
			return true;
		// Should not happen
		default:
			return false;
	}
};

// Remove animation class on animation end
const makeAnimationReset = element => {
	element.onanimationend = function() {
		this.classList.remove('flashes_green', 'flashes_red');
	};
};

const allCriteria = [];
// Contains the criteria of the verifiers made of mutually exclusive criteria
const easyCriteria = [];

class Criterion {
	constructor(func, description) {
		this.description = description
			.replace(/</gu, '&lt;')
			.replace(/>/gu, '&gt;')
			.replace(/[xyz]/gu, '<var class="$&">$&</var>');
		// Contains a boolean for each possible code
		this.accepts = newArray(5 * 5 * 5);
		// Contains only accepted codes
		this.accepted = [];
		// Contains only rejected codes
		this.rejected = [];
		for (let i = 0, x = 1; x <= 5; x += 1) {
			for (let y = 1; y <= 5; y += 1) {
				for (let z = 1; z <= 5; i += 1, z += 1) {
					this.accepts[i] = func(x, y, z);
					(this.accepts[i] ? this.accepted : this.rejected).push(i);
				}
			}
		}
		this.id = allCriteria.length;
		allCriteria.push(this);
	}
}

const allVerifiers = [
	[
		new Criterion((x, y, z) => x === 1, 'x = 1'),
		new Criterion((x, y, z) => x > 1, 'x > 1'),
	],
	[
		new Criterion((x, y, z) => x < 3, 'x < 3'),
		new Criterion((x, y, z) => x === 3, 'x = 3'),
		new Criterion((x, y, z) => x > 3, 'x > 3'),
	],
	[
		new Criterion((x, y, z) => y < 3, 'y < 3'),
		new Criterion((x, y, z) => y === 3, 'y = 3'),
		new Criterion((x, y, z) => y > 3, 'y > 3'),
	],
	[
		new Criterion((x, y, z) => y < 4, 'y < 4'),
		new Criterion((x, y, z) => y === 4, 'y = 4'),
		new Criterion((x, y, z) => y > 4, 'y > 4'),
	],
	[
		new Criterion((x, y, z) => x % 2 === 0, 'x è pari'),
		new Criterion((x, y, z) => x % 2 === 1, 'x è dispari'),
	],
	[
		new Criterion((x, y, z) => y % 2 === 0, 'y è pari'),
		new Criterion((x, y, z) => y % 2 === 1, 'y è dispari'),
	],
	[
		new Criterion((x, y, z) => z % 2 === 0, 'z è pari'),
		new Criterion((x, y, z) => z % 2 === 1, 'z è dispari'),
	],
	[
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 0, 'nessun 1'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 1, 'un 1'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 2, 'due 1'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 3, 'tre 1'),
	],
	[
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 0, 'nessun 3'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 1, 'un 3'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 2, 'due 3'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 3, 'tre 3'),
	],
	[
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 0, 'nessun 4'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 1, 'un 4'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 2, 'due 4'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 3, 'tre 4'),
	],
	[
		new Criterion((x, y, z) => x < y, 'x < y'),
		new Criterion((x, y, z) => x === y, 'x = y'),
		new Criterion((x, y, z) => x > y, 'x > y'),
	],
	[
		new Criterion((x, y, z) => x < z, 'x < z'),
		new Criterion((x, y, z) => x === z, 'x = z'),
		new Criterion((x, y, z) => x > z, 'x > z'),
	],
	[
		new Criterion((x, y, z) => y < z, 'y < z'),
		new Criterion((x, y, z) => y === z, 'y = z'),
		new Criterion((x, y, z) => y > z, 'y > z'),
	],
	[
		new Criterion((x, y, z) => x < y && x < z, 'x < y e x < z'),
		new Criterion((x, y, z) => y < x && y < z, 'y < x e y < z'),
		new Criterion((x, y, z) => z < x && z < y, 'z < x e z < y'),
	],
	[
		new Criterion((x, y, z) => x > y && x > z, 'x > y e x > z'),
		new Criterion((x, y, z) => y > x && y > z, 'y > x e y > z'),
		new Criterion((x, y, z) => z > x && z > y, 'z > x e z > y'),
	],
	[
		new Criterion((x, y, z) => x % 2 + y % 2 + z % 2 < 2, 'almeno due cifre pari'),
		new Criterion((x, y, z) => x % 2 + y % 2 + z % 2 >= 2, 'almeno due cifre dispari'),
	],
	[
		new Criterion((x, y, z) => x % 2 + y % 2 + z % 2 === 3, 'nessuna cifra pari'),
		new Criterion((x, y, z) => x % 2 + y % 2 + z % 2 === 2, 'una cifra pari'),
		new Criterion((x, y, z) => x % 2 + y % 2 + z % 2 === 1, 'due cifre pari'),
		new Criterion((x, y, z) => x % 2 + y % 2 + z % 2 === 0, 'tre cifre pari'),
	],
	[
		new Criterion((x, y, z) => (x + y + z) % 2 === 0, 'x+y+z è pari'),
		new Criterion((x, y, z) => (x + y + z) % 2 === 1, 'x+y+z è dispari'),
	],
	[
		new Criterion((x, y, z) => x + y < 6, 'x+y < 6'),
		new Criterion((x, y, z) => x + y === 6, 'x+y = 6'),
		new Criterion((x, y, z) => x + y > 6, 'x+y > 6'),
	],
	[
		new Criterion((x, y, z) => (x === y) + (x === z) + (y === z) === 3, 'x = y = z'),
		new Criterion((x, y, z) => (x === y) + (x === z) + (y === z) === 1, 'due cifre uguali fra loro e una diversa'),
		new Criterion((x, y, z) => (x === y) + (x === z) + (y === z) === 0, 'tre cifre diverse fra loro'),
	],
	[
		new Criterion((x, y, z) => (x === y) + (x === z) + (y === z) !== 1, 'x = y = z o tre cifre diverse fra loro'),
		new Criterion((x, y, z) => (x === y) + (x === z) + (y === z) === 1, 'due cifre uguali fra loro e una diversa'),
	],
	[
		new Criterion((x, y, z) => x < y && y < z, 'x < y < z'),
		new Criterion((x, y, z) => x > y && y > z, 'x > y > z'),
		new Criterion((x, y, z) => !(x < y && y < z || x > y && y > z), 'né x < y < z né x > y > z'),
	],
	[
		new Criterion((x, y, z) => x + y + z < 6, 'x+y+z < 6'),
		new Criterion((x, y, z) => x + y + z === 6, 'x+y+z = 6'),
		new Criterion((x, y, z) => x + y + z > 6, 'x+y+z > 6'),
	],
	[
		new Criterion((x, y, z) => (x + 1 === y) + (y + 1 === z) === 0, 'x+1 ≠ y e y+1 ≠ z'),
		new Criterion((x, y, z) => (x + 1 === y) + (y + 1 === z) === 1, 'x+2 = y+1 ≠ z oppure x+2 ≠ y+1 = z'),
		new Criterion((x, y, z) => (x + 1 === y) + (y + 1 === z) === 2, 'x+2 = y+1 = z'),
	],
	[
		new Criterion((x, y, z) => (x + 1 === y || x === y + 1) + (y + 1 === z || y === z + 1) === 0, 'x±1 ≠ y e y±1 ≠ z'),
		new Criterion((x, y, z) => (x + 1 === y || x === y + 1) + (y + 1 === z || y === z + 1) === 1, 'o x±1 = y o y±1 = z'),
		new Criterion((x, y, z) => x + 1 === y && y + 1 === z || x === y + 1 && y === z + 1, 'x+2 = y+1 = z o x = y+1 = z+2'),
	],
	[
		new Criterion((x, y, z) => x < 3, 'x < 3'),
		new Criterion((x, y, z) => y < 3, 'y < 3'),
		new Criterion((x, y, z) => z < 3, 'z < 3'),
	],
	[
		new Criterion((x, y, z) => x < 4, 'x < 4'),
		new Criterion((x, y, z) => y < 4, 'y < 4'),
		new Criterion((x, y, z) => z < 4, 'z < 4'),
	],
	[
		new Criterion((x, y, z) => x === 1, 'x = 1'),
		new Criterion((x, y, z) => y === 1, 'y = 1'),
		new Criterion((x, y, z) => z === 1, 'z = 1'),
	],
	[
		new Criterion((x, y, z) => x === 3, 'x = 3'),
		new Criterion((x, y, z) => y === 3, 'y = 3'),
		new Criterion((x, y, z) => z === 3, 'z = 3'),
	],
	[
		new Criterion((x, y, z) => x === 4, 'x = 4'),
		new Criterion((x, y, z) => y === 4, 'y = 4'),
		new Criterion((x, y, z) => z === 4, 'z = 4'),
	],
	[
		new Criterion((x, y, z) => x > 1, 'x > 1'),
		new Criterion((x, y, z) => y > 1, 'y > 1'),
		new Criterion((x, y, z) => z > 1, 'z > 1'),
	],
	[
		new Criterion((x, y, z) => x > 3, 'x > 3'),
		new Criterion((x, y, z) => y > 3, 'y > 3'),
		new Criterion((x, y, z) => z > 3, 'z > 3'),
	],
	[
		new Criterion((x, y, z) => x % 2 === 0, 'x è pari'),
		new Criterion((x, y, z) => x % 2 === 1, 'x è dispari'),
		new Criterion((x, y, z) => y % 2 === 0, 'y è pari'),
		new Criterion((x, y, z) => y % 2 === 1, 'y è dispari'),
		new Criterion((x, y, z) => z % 2 === 0, 'z è pari'),
		new Criterion((x, y, z) => z % 2 === 1, 'z è dispari'),
	],
	[
		new Criterion((x, y, z) => x <= y && x <= z, 'x ≤ y e x ≤ z'),
		new Criterion((x, y, z) => y <= x && y <= z, 'y ≤ x e y ≤ z'),
		new Criterion((x, y, z) => z <= x && z <= y, 'z ≤ x e z ≤ y'),
	],
	[
		new Criterion((x, y, z) => x >= y && x >= z, 'x ≥ y e x ≥ z'),
		new Criterion((x, y, z) => y >= x && y >= z, 'y ≥ x e y ≥ z'),
		new Criterion((x, y, z) => z >= x && z >= y, 'z ≥ x e z ≥ y'),
	],
	[
		new Criterion((x, y, z) => (x + y + z) % 3 === 0, 'x+y+z è un multiplo di 3'),
		new Criterion((x, y, z) => (x + y + z) % 4 === 0, 'x+y+z è un multiplo di 4'),
		new Criterion((x, y, z) => (x + y + z) % 5 === 0, 'x+y+z è un multiplo di 5'),
	],
	[
		new Criterion((x, y, z) => x + y === 4, 'x+y = 4'),
		new Criterion((x, y, z) => x + z === 4, 'x+z = 4'),
		new Criterion((x, y, z) => y + z === 4, 'y+z = 4'),
	],
	[
		new Criterion((x, y, z) => x + y === 6, 'x+y = 6'),
		new Criterion((x, y, z) => x + z === 6, 'x+z = 6'),
		new Criterion((x, y, z) => y + z === 6, 'y+z = 6'),
	],
	[
		new Criterion((x, y, z) => x === 1, 'x = 1'),
		new Criterion((x, y, z) => x > 1, 'x > 1'),
		new Criterion((x, y, z) => y === 1, 'y = 1'),
		new Criterion((x, y, z) => y > 1, 'y > 1'),
		new Criterion((x, y, z) => z === 1, 'z = 1'),
		new Criterion((x, y, z) => z > 1, 'z > 1'),
	],
	[
		new Criterion((x, y, z) => x < 3, 'x < 3'),
		new Criterion((x, y, z) => x === 3, 'x = 3'),
		new Criterion((x, y, z) => x > 3, 'x > 3'),
		new Criterion((x, y, z) => y < 3, 'y < 3'),
		new Criterion((x, y, z) => y === 3, 'y = 3'),
		new Criterion((x, y, z) => y > 3, 'y > 3'),
		new Criterion((x, y, z) => z < 3, 'z < 3'),
		new Criterion((x, y, z) => z === 3, 'z = 3'),
		new Criterion((x, y, z) => z > 3, 'z > 3'),
	],
	[
		new Criterion((x, y, z) => x < 4, 'x < 4'),
		new Criterion((x, y, z) => x === 4, 'x = 4'),
		new Criterion((x, y, z) => x > 4, 'x > 4'),
		new Criterion((x, y, z) => y < 4, 'y < 4'),
		new Criterion((x, y, z) => y === 4, 'y = 4'),
		new Criterion((x, y, z) => y > 4, 'y > 4'),
		new Criterion((x, y, z) => z < 4, 'z < 4'),
		new Criterion((x, y, z) => z === 4, 'z = 4'),
		new Criterion((x, y, z) => z > 4, 'z > 4'),
	],
	[
		new Criterion((x, y, z) => x < y && x < z, 'x < y e x < z'),
		new Criterion((x, y, z) => x > y && x > z, 'x > y e x > z'),
		new Criterion((x, y, z) => y < x && y < z, 'y < x e y < z'),
		new Criterion((x, y, z) => y > x && y > z, 'y > x e y > z'),
		new Criterion((x, y, z) => z < x && z < y, 'z < x e z < y'),
		new Criterion((x, y, z) => z > x && z > y, 'z > x e z > y'),
	],
	[
		new Criterion((x, y, z) => x < y, 'x < y'),
		new Criterion((x, y, z) => x < z, 'x < z'),
		new Criterion((x, y, z) => x === y, 'x = y'),
		new Criterion((x, y, z) => x === z, 'x = z'),
		new Criterion((x, y, z) => x > y, 'x > y'),
		new Criterion((x, y, z) => x > z, 'x > z'),
	],
	[
		new Criterion((x, y, z) => y < x, 'y < x'),
		new Criterion((x, y, z) => y < z, 'y < z'),
		new Criterion((x, y, z) => y === x, 'y = x'),
		new Criterion((x, y, z) => y === z, 'y = z'),
		new Criterion((x, y, z) => y > x, 'y > x'),
		new Criterion((x, y, z) => y > z, 'y > z'),
	],
	[
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 0, 'nessun 1'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 0, 'nessun 3'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 1, 'un 1'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 1, 'un 3'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 2, 'due 1'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 2, 'due 3'),
	],
	[
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 0, 'nessun 3'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 0, 'nessun 4'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 1, 'un 3'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 1, 'un 4'),
		new Criterion((x, y, z) => (x === 3) + (y === 3) + (z === 3) === 2, 'due 3'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 2, 'due 4'),
	],
	[
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 0, 'nessun 1'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 0, 'nessun 4'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 1, 'un 1'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 1, 'un 4'),
		new Criterion((x, y, z) => (x === 1) + (y === 1) + (z === 1) === 2, 'due 1'),
		new Criterion((x, y, z) => (x === 4) + (y === 4) + (z === 4) === 2, 'due 4'),
	],
	[
		new Criterion((x, y, z) => x < y, 'x < y'),
		new Criterion((x, y, z) => x === y, 'x = y'),
		new Criterion((x, y, z) => x > y, 'x > y'),
		new Criterion((x, y, z) => x < z, 'x < z'),
		new Criterion((x, y, z) => x === z, 'x = z'),
		new Criterion((x, y, z) => x > z, 'x > z'),
		new Criterion((x, y, z) => y < z, 'y < z'),
		new Criterion((x, y, z) => y === z, 'y = z'),
		new Criterion((x, y, z) => y > z, 'y > z'),
	],
];

for (let i = 0; i < allVerifiers.length; i += 1) {
	for (let j = 0; j < allVerifiers[i].length; j += 1) {
		const a = allVerifiers[i][j];
		a.verifier = i;
		a.index = j;
		// For each criterion with lower id, indicates whether it can be in the same enigma as this
		a.compatible = newArray(a.id, k => {
			const b = allCriteria[k];
			// If a and b are part of the same verifier, they are not compatible
			return b.verifier !== i && [
				// If the intersection of accepted codes is empty, they are not compatible
				a.accepted.length < b.accepted.length ? {
					array: a.accepted,
					criterion: b,
				} : {
					array: b.accepted,
					criterion: a,
				},
				// If the accepted codes are a subset of the other, they are not compatible
				{
					array: a.rejected,
					criterion: b,
				},
				{
					array: b.rejected,
					criterion: a,
				},
			].every(({array, criterion}) => array.some(c => criterion.accepts[c]));
		});
		if (i < 25) {
			easyCriteria.push(a);
		}
	}
}

const canonical = document.querySelector('link[rel="canonical"]').href;
const headers = [...document.getElementById('headers').children];
const dialog = document.getElementById('dialog');
const errors = [...document.getElementsByClassName('error')];
const errorNoCriterion = document.getElementById('error_no_criterion');
const errorNoSolution = document.getElementById('error_no_solution');
const errorNoUniqueSolution = document.getElementById('error_no_unique_solution');
const errorRedundand = document.getElementById('error_redundand');
const play = document.getElementById('play');
const link = document.getElementById('link');
const copied = document.getElementById('copied');
const verifiers = document.getElementById('verifiers');
const questionsTable = document.getElementById('questions_table');
const questionsTBody = document.getElementById('questions_tbody');
const solutionTable = document.getElementById('solution_table');
const solutionTBody = document.getElementById('solution_tbody');

// Show a modal containing an error message
const showError = error => {
	errors.forEach(hide);
	show(error);
	dialog.showModal();
};

// The criteria that make up the current enigma
let criteria;

// The solution of the current enigma
let solution;

// The questions made for the current enigma
let questions;

// The first cell of the last line of the questions table; may not be in the last tr and use rowspan
let lastCodeTd;

// Elapsed turns in the current enigma
let turns;

// The state of the columns of the solution; the table is colored using the minimum; -1 is red, 0 is white, 1 is green
const colors = newArray(3);

// Disable the question button if the code is not valid or the same question has already been made
const disableQuestionButtonIfCannotQuestion = () => {
	const {elements} = document.forms.question_form;
	const c = elements.code;
	const v = elements.verifier.value;
	const b = elements.question_button;
	b.disabled = !c.validity.valid || questions.some(({code, verifier}) => code === c.value && verifier === v);
};

// Append a new verifier to verifiers
const appendToVerifiers = (letter, verifier) => {
	append(
		verifiers,
		append(
			create('fieldset'),
			onClick(
				addClasses(create('legend', letter), 'clickable'),
				function() {
					document.forms.question_form.elements.verifier.value = this.innerText;
					disableQuestionButtonIfCannotQuestion();
				},
			),
			append(
				addClasses(create('ol'), 'criteria'),
				...verifier.map(c => onClick(
					addClasses(create('li', c.description), 'clickable'),
					function() {
						if (this.classList.contains('clickable')) {
							const parent = this.parentElement;
							color(parent.parentElement, toggle(this, parent.children));
						}
					},
					function(event) {
						if (this.classList.contains('clickable')) {
							event.preventDefault();
							const parent = this.parentElement;
							color(parent.parentElement, choose(this, parent.children));
						}
					},
				)),
			),
		),
	);
};

// Set up variables and show the enigma
const setup = (setupCriteria, setupSolution, setupId) => {
	criteria = setupCriteria;
	solution = newArray(3);
	for (let i = 2, tmp = setupSolution; i >= 0; i -= 1) {
		solution[i] = tmp % 5;
		tmp = (tmp - solution[i]) / 5;
		solution[i] += 1;
	}
	solution = solution.join('');
	questions = [];
	lastCodeTd = null;
	turns = 0;
	colors.fill(0);
	for (const header of headers) {
		header.open = false;
	}
	link.href = `?e=${setupId}`;
	link.innerText = setupId;
	verifiers.innerText = '';
	document.forms.question_form.elements.verifier.innerText = '';
	for (let i = 0; i < criteria.length; i += 1) {
		const letter = String.fromCodePoint('A'.codePointAt(0) + i);
		appendToVerifiers(letter, allVerifiers[criteria[i].verifier]);
		append(
			document.forms.question_form.elements.verifier,
			create('option', letter),
		);
	}
	document.forms.question_form.elements.code.value = '';
	document.forms.question_form.elements.question_button.disabled = true;
	hide(questionsTable);
	questionsTBody.innerText = '';
	color(solutionTable, 0);
	for (const tr of solutionTBody.children) {
		for (let i = 0; i < tr.children.length; i += 1) {
			addClasses(tr.children[i], 'clickable');
			tr.children[i].classList.remove('correct', 'deleted', 'guess');
		}
	}
	document.forms.solve_form.elements.solve_button.disabled = true;
	hide(document.forms.solve_form.elements.result);
	show(play, 'flashes');
	play.scrollIntoView({
		behavior: 'smooth',
	});
};

// The keys used to encrypt and decrypt the id
const keys = newArray(6 * 16 * 8, () => [
	0n,
	0n,
]);

// Generate keys using xoshiro256** by Blackman and Vigna; see https://prng.di.unimi.it/xoshiro256starstar.c
{
	const cut = x => x & 0xFFFFFFFFFFFFFFFFn;
	const rotl = (x, k) => cut(x << k) | x >> 64n - k;
	let s0 = 0xD9C5DCD52EE9BFC1n;
	let s1 = 0xC0D5E5B2B57633FCn;
	let s2 = 0x1B5F320C40C7113Bn;
	let s3 = 0x393842EB45C104A0n;
	for (const key of keys) {
		for (let i = 0; i < key.length; i += 1) {
			for (let j = 0; j < 2; j += 1) {
				key[i] = key[i] << 64n | rotl(cut(s1 * 5n), 7n) * 9n;
				const t = cut(s1 << 17n);
				s2 ^= s0;
				s3 ^= s1;
				s1 ^= s2;
				s0 ^= s3;
				s2 ^= t;
				s3 = rotl(s3, 45n);
			}
		}
	}
}

// Import an enigma using its id; used in the import tab, when clicking on links, and when the 'e' url parameter is set
const importEnigma = importId => {
	const importCriteria = newArray(importId.length / 2);
	{
		// Decrypt using swap-or-not
		const max = (1n << BigInt(4 * importId.length)) - 1n;
		let x = BigInt(`0x${importId}`);
		for (let i = keys.length - 1; i >= 0; i -= 1) {
			x = swapOrNot(x, keys[i], max);
		}
		// Take each byte and use it as an index in the criteria array
		for (let i = 0; i < importCriteria.length; i += 1) {
			const c = Number(x & 0xFFn);
			if (c >= allCriteria.length) {
				showError(errorNoCriterion);
				return;
			}
			importCriteria[i] = allCriteria[c];
			x >>= 8n;
		}
	}
	importCriteria.sort((a, b) => a.id - b.id);
	let importSolution = null;
	// For each code accepted by the criterion that accepts fewer codes
	for (const s of importCriteria[importCriteria.reduce((a, c, i) => c.accepted.length < a.value ? {
		index: i,
		value: c.accepted.length,
	} : a, {
		index: -1,
		value: 5 * 5 * 5,
	}).index].accepted) {
		if (importCriteria.every(c => c.accepts[s])) {
			if (importSolution) {
				showError(errorNoUniqueSolution);
				return;
			}
			importSolution = s;
		}
	}
	if (!importSolution) {
		showError(errorNoSolution);
		return;
	}
	// If a criterion does not reject at least a code that every other accept, it is redundand
	if (!importCriteria.every(c => c.rejected.some(s => importCriteria.every(c2 => c === c2 || c2.accepts[s])))) {
		showError(errorRedundand);
		return;
	}
	setup(importCriteria, importSolution, importId);
};

// Import an enigma, then add a new entry to the history of the browser as if a new page was visited
const importEnigmaAndPush = importId => {
	importEnigma(importId);
	history.pushState({
		enigma: importId,
	}, '', link.href);
};

// Click on the dialog close button
onClick(
	document.getElementById('close_button'),
	() => dialog.close(),
);

// Set up tabs showing up when headers are expanded
{
	const tabs = [...document.getElementsByClassName('tab')];
	for (let i = 0; i < headers.length; i += 1) {
		headers[i].ontoggle = event => {
			if (event.newState === 'open') {
				for (let j = 0; j < headers.length; j += 1) {
					if (i !== j) {
						headers[j].open = false;
					}
				}
				show(tabs[i]);
			} else {
				hide(tabs[i]);
			}
		};
	}
}

// Set up the example
{
	const example = document.getElementById('example');
	const exampleVerifiers = [
		3,
		8,
		10,
		13,
	];
	for (let i = 0; i < exampleVerifiers.length; i += 1) {
		append(
			example,
			append(
				create('fieldset'),
				create('legend', String.fromCodePoint('A'.codePointAt(0) + i)),
				append(
					addClasses(create('ol'), 'criteria'),
					...allVerifiers[exampleVerifiers[i]].map(c => create('li', c.description)),
				),
			),
		);
	}
}

// Make links to enigmas work without reloading the page
for (const enigma of document.getElementsByClassName('enigma')) {
	onClick(
		enigma,
		function(event) {
			event.preventDefault();
			importEnigmaAndPush(this.innerText);
		},
	);
}

// Make labels for <select>s open the <select> when clicked
for (const label of document.getElementsByClassName('select')) {
	onClick(
		label,
		function() {
			this.control.showPicker();
		},
	);
}

{
	// Generate the ID and call setup
	const encryptAndSetup = (setupCriteria, setupSolution) => {
		const max = (1n << BigInt(8 * setupCriteria.length)) - 1n;
		// Assign a byte to each criterion using its id, then concatenate all of them in a big number
		let x = setupCriteria.reduce((a, c) => a << 8n | BigInt(c.id), 0n);
		// Encrypt using swap-or-not
		for (const key of keys) {
			x = swapOrNot(x, key, max);
		}
		// Convert to hexadecimal
		x = x.toString(16).toUpperCase().padStart(length * 2, '0');
		setup(setupCriteria, setupSolution, x);
		// Add an entry in the history of the browser
		history.pushState({
			enigma: x,
		}, '', link.href);
	};

	// Use one worker per core
	const workers = newArray(navigator.hardwareConcurrency);

	// Terminate all workers; may be called because the generation succeeded or because it was canceled
	const end = () => {
		mapInPlace(workers, w => {
			if (w) {
				w.terminate();
			}
			return null;
		});
		hide(document.forms.generate_form.elements.cancel_button);
		show(document.forms.generate_form.elements.generate_button);
		document.documentElement.classList.remove('progress');
	};

	// Assign a first criterion to a worker; return the next criterion available or -1 on failure
	const post = (worker, message) => {
		// Skip criteria that do not have enough accepted codes
		for (; message.first + message.length - 1 < message.criteria.length; message.first += 1) {
			if (message.criteria[message.first].accepted.length > message.length - 1) {
				worker.postMessage(message);
				return message.first + 1;
			}
		}
		return -1;
	};

	// Used to create workers from a string containing the JavaScript code
	/* global workerString */
	const url = URL.createObjectURL(new Blob([workerString], {
		type: 'text/javascript',
	}));

	// Generate an enigma using web workers; can be canceled
	document.forms.generate_form.onsubmit = function(event) {
		// Avoid reloading the page
		event.preventDefault();
		// Add a spinner to the cursor
		addClasses(document.documentElement, 'progress');
		// Switch button
		hide(this.elements.generate_button);
		show(this.elements.cancel_button);
		// Shuffle criteria in random order
		const cs = (this.elements.difficulty.selectedIndex ? allCriteria : easyCriteria).map(item => ({
			item,
			score: Math.random(),
		}));
		mapInPlace(cs.sort((a, b) => a.score - b.score), c => c.item);
		const length = Number(this.elements.size.value);
		// If length === 1, the generation is done in the main thread, without spawning workers
		if (length === 1) {
			const criterion = cs.find(c => c.accepted.length === 1);
			encryptAndSetup([criterion], criterion.accepted[0]);
		} else {
			// The first criterion not yet assigned to a worker
			let first = 0;
			// If first === -1, all criteria has been assigned to workers
			for (let i = 0; i < workers.length && first !== -1; i += 1) {
				const worker = new Worker(url);
				worker.onmessage = function(message) {
					// If a worker sends a non-null message, it has generated an enigma
					if (message.data) {
						end();
						encryptAndSetup(message.data.criteria, message.data.solution);
					// If a worker sends a null message, no enigma could be found
					} else if (first !== -1) {
						// Give the worker another first criterion
						first = post(this, {
							criteria: cs,
							first,
							length,
						});
					}
				};
				// Give a first criterion to the worker to make it start
				first = post(worker, {
					criteria: cs,
					first,
					length,
				});
				workers[i] = worker;
			}
		}
	};

	// Make it possible to cancel the generation
	onClick(
		document.forms.generate_form.elements.cancel_button,
		end,
	);
}

// Make virtual keyboards use capital letters
if ('autocapitalize' in document.forms.import_form.elements.id) {
	document.forms.import_form.elements.id.autocapitalize = 'characters';
}

// Accept only hexadecimal digits as IDs
document.forms.import_form.elements.id.onbeforeinput = event => {
	if (event.data && /[^\dA-Fa-f]/u.test(event.data)) {
		event.preventDefault();
	}
};

// Enable import button if and only if ID is valid
document.forms.import_form.elements.id.oninput = function() {
	document.forms.import_form.elements.import_button.disabled = !this.validity.valid;
};

// Auto-capitalize ID
document.forms.import_form.elements.id.onchange = function() {
	this.value = this.value.toUpperCase();
};

// Import button imports the enigma with the ID
document.forms.import_form.onsubmit = function(event) {
	event.preventDefault();
	importEnigmaAndPush(this.elements.id.value);
};

// Remove the class responsible for the animation to make it possible to flash it again
play.onanimationend = function() {
	this.classList.remove('flashes');
};

// Copy button copies the link in the clipboard
onClick(
	document.getElementById('copy'),
	() => {
		navigator.clipboard.writeText(`${canonical}?e=${link.innerText}`);
		const animations = copied.getAnimations();
		if (animations.length) {
			animations[0].cancel();
			animations[0].play();
		} else {
			addClasses(copied, 'fades');
			show(copied);
		}
	},
);

// Hide the element; remove the class responsible for the animation to make it possible to fade it again
copied.onanimationend = function() {
	hide(this);
	this.classList.remove('fades');
};

// If sharing is supported, show the share button
if (navigator.canShare) {
	show(onClick(
		document.getElementById('share'),
		() => navigator.share({
			url: `${canonical}?e=${link.innerText}`,
		}),
	));
}

// Code can only be digits from 1 to 5
document.forms.question_form.elements.code.onbeforeinput = event => {
	if (event.data && /[^1-5]/u.test(event.data)) {
		event.preventDefault();
	}
};

// Enable or disable question button when code or verifier changes
document.forms.question_form.elements.code.oninput = disableQuestionButtonIfCannotQuestion;
document.forms.question_form.elements.verifier.onchange = disableQuestionButtonIfCannotQuestion;

// Question a verifier
document.forms.question_form.onsubmit = function(event) {
	event.preventDefault();
	// Disable the question button, because questioning the same verifier with the same code is useless
	this.elements.question_button.disabled = true;
	// Save the question to disallow repeating it
	questions.push([
		this.elements.code.value,
		this.elements.verifier.value,
	]);
	// Add a row to the table
	const tr = create('tr');
	{
		let code = 0;
		for (let i = 0; i < this.elements.code.value.length; i += 1) {
			code *= 5;
			code += this.elements.code.value[i] - 1;
		}
		// If the previous code is reused, but for at most three times
		if (this.elements.code.value === lastCodeTd?.innerText && lastCodeTd.rowSpan < 3) {
			lastCodeTd.rowSpan += 1;
			if (lastCodeTd.rowSpan === 3) {
				this.elements.code.value = '';
			}
		} else {
			turns += 1;
			const td = create('td', writeCode(document.forms.question_form.elements.code.value));
			makeAnimationReset(td);
			lastCodeTd = td;
			tr.append(td);
		}
		const td = create('td');
		if (criteria[this.elements.verifier.selectedIndex].accepts[code]) {
			addClasses(tr, 'flashes_green');
			addClasses(lastCodeTd, 'flashes_green');
			td.innerHTML = '<span class="green">✔</span>';
		} else {
			addClasses(tr, 'flashes_red');
			addClasses(lastCodeTd, 'flashes_red');
			td.innerHTML = '<span class="red">✘</span>';
		}
		append(tr, create('td', this.elements.verifier.selectedOptions[0].innerText), td);
	}
	append(questionsTBody, tr);
	show(questionsTable);
	tr.scrollIntoView({
		behavior: 'smooth',
		block: 'end',
	});
};

{
	const solutionDigits = newArray(3, i => newArray(5, j => solutionTBody.children[j].children[i]));

	// Color the border of the solution table and enable or disable the verify button
	const repaintSolution = () => {
		document.forms.solve_form.elements.solve_button.disabled = !color(solutionTable, Math.min(...colors));
	};

	for (const tr of solutionTBody.children) {
		for (let i = 0; i < tr.children.length; i += 1) {
			onClick(
				tr.children[i],
				function() {
					if (this.classList.contains('clickable')) {
						colors[i] = toggle(this, solutionDigits[i]);
						repaintSolution();
					}
				},
				function(event) {
					if (this.classList.contains('clickable')) {
						event.preventDefault();
						colors[i] = choose(this, solutionDigits[i]);
						repaintSolution();
					}
				},
			);
		}
	}
}

// Check the solution and end the game
document.forms.solve_form.onsubmit = function(event) {
	event.preventDefault();
	for (const verifier of verifiers.children) {
		for (const criterion of verifier.children[1].children) {
			criterion.classList.remove('clickable');
		}
	}
	document.forms.question_form.elements.question_button.disabled = true;
	{
		for (let i = 0; i < criteria.length; i += 1) {
			const correct = verifiers.children[i].children[1].children[criteria[i].index];
			addClasses(correct, 'correct');
			// If correct was deleted, -1; if it is guess, 1; if it is neither, 0
			const c = correct.classList.contains('deleted') ? -1 : correct.classList.contains('guess');
			color(verifiers.children[i], c);
		}
		let guess = '';
		for (let i = 0; i < 3; i += 1) {
			for (let j = 0; j < solutionTBody.children.length; j += 1) {
				solutionTBody.children[j].children[i].classList.remove('clickable');
				if (solutionTBody.children[j].children[i].classList.contains('guess')) {
					guess += 5 - j;
				}
			}
		}
		this.elements.solve_button.disabled = true;
		if (guess === solution) {
			color(solutionTable, 1, true);
			color(this.elements.result, 1, true);
			this.elements.result.innerText = `Hai vinto in ${turns} turni e ${questions.length} interrogazioni!`;
		} else {
			color(solutionTable, -1, true);
			color(this.elements.result, -1, true);
			this.elements.result.innerHTML = `Hai perso! Il codice corretto è ${writeCode(solution)}.`;
		}
	}
	for (let i = 0; i < solution.length; i += 1) {
		addClasses(solutionTBody.children[5 - solution[i]].children[i], 'correct');
	}
	show(this.elements.result);
	this.elements.result.scrollIntoView({
		behavior: 'smooth',
		block: 'end',
	});
};

// Make animations reset so that it is possible to flash again on next game
makeAnimationReset(solutionTable);
makeAnimationReset(document.forms.solve_form.elements.result);

// Open the first tab
headers[0].open = true;

// If called with a valid e param, import its value as an enigma
{
	let e = new URLSearchParams(document.location.search).get('e');
	if (e?.length && e.length <= 16 && !/[^\dA-Fa-f]/u.test(e) && !(e.length % 2)) {
		importEnigma(e);
	} else {
		e = null;
	}
	history.replaceState({
		enigma: e,
	}, '', link.href);
}

// Navigate history without reloading
onpopstate = event => {
	if (event.state.enigma) {
		importEnigma(event.state.enigma);
	} else {
		hide(play);
		headers[0].open = true;
	}
};

// Remove the spinner
document.documentElement.classList.remove('wait');
