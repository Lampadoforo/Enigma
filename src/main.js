'use strict';

// Return the char corresponding to the codepoint of the first character of a string plus a value
const charSum = (c, n) => String.fromCodePoint(c.codePointAt(0) + n);

// Return the difference of the codepoints of the first character of two strings
const charDiff = (a, b) => a.codePointAt(0) - b.codePointAt(0);

// Create a new array of specified length; optionally populates it using a function taking the index as a parameter
const newArray = (length, func) => Array.from({length}, func && ((_, i) => func(i)));

// Apply a function to each element of the array and put the result in place of the element
const mapInPlace = (array, func) => {
	for (let i = 0; i < array.length; i += 1) {
		array[i] = func(array[i], i);
	}
	return array;
};

// Sort an array using a score function
const sort = (array, func = x => x) => array.sort((a, b) => func(a) - func(b));

// Convert the solution from a number (from 0 to 124) to a string (from '111' to '555')
const convertSolution = solution => {
	const digits = newArray(3);
	for (let i = 2; i >= 0; i -= 1) {
		digits[i] = solution % 5;
		solution = (solution - digits[i]) / 5;
		digits[i] += 1;
	}
	return digits.join('');
};

// A round of encryption; see An Enciphering Scheme Based on a Card Shuffle (2012) by Hoang, Morris, and Rogaway
const swapOrNot = (x, keys, mask) => {
	const xp = keys[0] & mask ^ x;
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
	element.classList.remove('guess');
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

// The criteria of the easy verifier
const easyCriteria = [];

const allCriteria = [];

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

// THe verifiers made of mutually exclusive criteria
const easyVerifiers = [
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
];

const allVerifiers = [
	...easyVerifiers,
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
			return [
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
		if (i < easyVerifiers.length) {
			easyCriteria.push(a);
		}
	}
}

// For each verifier, contains an array of verifier indexes that cannot be used as decoys for that verifier
const incompatibleDecoys = allVerifiers.map(() => []);

for (let i = 0; i < allVerifiers.length; i += 1) {
	for (let j = 0; j < i; j += 1) {
		// If i and j contain an identical criterion
		if (allVerifiers[i].some(a => allVerifiers[j].some(b => {
			// Identical criteria are not compatible
			if (a.accepted.length !== b.accepted.length || b.compatible[a]) {
				return false;
			}
			let aa;
			let bb;
			if (a.accepted.length < a.rejected.length) {
				aa = a.accepted;
				bb = b.accepted;
			} else {
				aa = a.rejected;
				bb = b.rejected;
			}
			for (let k = 0; k < aa.length; k += 1) {
				if (aa[k] !== bb[k]) {
					return false;
				}
			}
			return true;
		}))) {
			incompatibleDecoys[i].push(j);
			incompatibleDecoys[j].push(i);
		}
	}
	// Each criterion is identical to itself
	incompatibleDecoys[i].push(i);
}

const canonical = document.querySelector('link[rel="canonical"]').href;
const headers = [...document.getElementsByTagName('details')];
const dialog = document.getElementById('dialog');
const errors = [...document.getElementsByClassName('error')];
const errorNoCriterion = document.getElementById('error_no_criterion');
const errorIncompatible = document.getElementById('error_incompatible');
const errorNotSorted = document.getElementById('error_not_sorted');
const errorNoSolution = document.getElementById('error_no_solution');
const errorNoUniqueSolution = document.getElementById('error_no_unique_solution');
const errorRedundand = document.getElementById('error_redundand');
const errorNoVerifier = document.getElementById('error_no_verifier');
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
	return null;
};

// The current enigma
let enigma;

// The questions made for the current enigma
let questions;

// The first cell of the last line of the questions table; may not be in the last tr and use rowspan
let lastCodeTd;

// Elapsed turns in the current enigma
let turns;

// The state of the columns of the solution; the table is colored using the minimum; -1 is red, 0 is white, 1 is green
const colors = newArray(3);

// If the game has ended
let gameOver;

// Check if a verifier has already been questioned with a code
const hasBeenQuestioned = (c, v) => questions.some(({code, verifier}) => code === c.value && verifier === v);

// Disable the question button if the game is over or the code is not valid or the same question has already been made
const disableQuestionButtonIfCannotQuestion = () => {
	const {elements} = document.forms.question_form;
	const c = elements.code;
	const v = elements.verifier.value;
	elements.question_button.disabled = gameOver || !c.validity.valid || hasBeenQuestioned(c, v);
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
				addClasses(create('ul'), 'criteria'),
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
const setup = (setupEnigma, doubles) => {
	setupEnigma.solution = convertSolution(setupEnigma.solution);
	// Set globals
	enigma = setupEnigma;
	questions = [];
	lastCodeTd = null;
	turns = 0;
	colors.fill(0);
	gameOver = false;
	// Close all tabs
	for (const header of headers) {
		header.open = false;
	}
	// Set link
	link.href = `?e=${setupEnigma.id}`;
	link.innerText = setupEnigma.id;
	// Populate the verifiers <div> and the verifier <select>
	verifiers.innerText = '';
	document.forms.question_form.elements.verifier.innerText = '';
	for (let i = 0; i < setupEnigma.criteria.length; i += 1) {
		const letter = charSum('A', i);
		appendToVerifiers(letter, doubles ? doubles[i] : allVerifiers[setupEnigma.criteria[i].verifier]);
		append(
			document.forms.question_form.elements.verifier,
			create('option', letter),
		);
	}
	// Remove previous questions
	document.forms.question_form.elements.code.value = '';
	document.forms.question_form.elements.question_button.disabled = true;
	hide(questionsTable);
	questionsTBody.innerText = '';
	color(solutionTable, 0);
	// Clean solution table
	for (const tr of solutionTBody.children) {
		for (let i = 0; i < tr.children.length; i += 1) {
			addClasses(tr.children[i], 'clickable');
			tr.children[i].classList.remove('correct', 'deleted', 'guess');
		}
	}
	document.forms.verify_form.elements.verify_button.disabled = true;
	// Hide victory or loss text
	hide(document.forms.verify_form.elements.result);
	show(play, 'flashes');
	play.scrollIntoView({
		behavior: 'smooth',
	});
};

// The keys used to encrypt and decrypt the id
const keys = newArray(6 * 14 * 8, () => [
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

// Make a mask to encrypt only the used bits of data
const makeMask = (length, double) => {
	if (double) {
		let mask = 0n;
		for (let i = 0; i < length; i += 1) {
			mask = mask << 16n | 0xFF3Fn;
		}
		return mask;
	}
	return (1n << BigInt(8 * length)) - 1n;
};

const encrypt = (data, length, double) => {
	const mask = makeMask(length, double);
	const rounds = 6 * length * (double ? 14 : 8);
	for (let i = 0; i < rounds; i += 1) {
		data = swapOrNot(data, keys[i], mask);
	}
	return data;
};

const decrypt = (data, length, double) => {
	const mask = makeMask(length, double);
	for (let i = 6 * length * (double ? 14 : 8) - 1; i >= 0; i -= 1) {
		data = swapOrNot(data, keys[i], mask);
	}
	return data;
};

// Convert from base64 to a BigInt
const fromBase64 = c => {
	if (c >= 'A' && c <= 'Z') {
		return BigInt(charDiff(c, 'A'));
	}
	if (c >= 'a' && c <= 'z') {
		return BigInt(charDiff(c, 'a') + 26);
	}
	if (c >= '0' && c <= '9') {
		return BigInt(charDiff(c, '0') + 52);
	}
	if (c === '-') {
		return 62n;
	}
	return 63n;
};

// Extract single criteria from id
const importSingle = importId => {
	if (!/^(?:[\dA-F]{2}){2,8}$/u.test(importId)) {
		return null;
	}
	const length = importId.length / 2;
	let data = decrypt(BigInt(`0x${importId}`), length, false);
	const criteria = newArray(length);
	for (let i = length - 1; i >= 0; i -= 1) {
		{
			const criterion = Number(data & 0xFFn);
			if (criterion >= allCriteria.length) {
				return showError(errorNoCriterion);
			}
			criteria[i] = allCriteria[criterion];
		}
		data >>= 8n;
		if (i < length - 1 && criteria[i].verifier > criteria[i + 1].verifier) {
			return showError(errorNotSorted);
		}
	}
	return {
		criteria,
		indexes: criteria.map(c => c.index),
	};
};

// Extract double criteria from decrypted data
const extractEnigmaFromData = (data, length) => {
	const result = {
		criteria: newArray(length),
		doubles: newArray(length),
		indexes: newArray(length),
	};
	{
		let tmp = data;
		let old;
		for (let i = length - 1; i >= 0; i -= 1) {
			const decoy = Number(tmp & 0xFFn);
			if (decoy >= allVerifiers.length) {
				return showError(errorNoVerifier);
			}
			tmp >>= 8n;
			{
				const criterion = Number(tmp & 0xFFn);
				if (criterion >= allCriteria.length) {
					return showError(errorNoCriterion);
				}
				result.criteria[i] = allCriteria[criterion];
			}
			if (incompatibleDecoys[result.criteria[i].verifier].includes(decoy)) {
				return showError(errorIncompatible);
			}
			tmp >>= 8n;
			let current;
			{
				const v = allVerifiers[result.criteria[i].verifier];
				const d = allVerifiers[decoy];
				if (result.criteria[i].verifier < decoy) {
					current = result.criteria[i].verifier;
					result.doubles[i] = v.concat(d);
					result.indexes[i] = result.criteria[i].index;
				} else {
					current = decoy;
					result.doubles[i] = d.concat(v);
					result.indexes[i] = d.length + result.criteria[i].index;
				}
			}
			if (i < length - 1 && current > old) {
				return showError(errorNotSorted);
			}
			old = current;
		}
	}
	return result;
};

// Extract double criteria from id
const importDouble = importId => {
	if (!/^[G-V][\dA-F][A-Za-z\d\-.](?:[\dA-F]{2}[A-Za-z\d\-.]){1,7}$/u.test(importId)) {
		return null;
	}
	let data = BigInt(charDiff(importId, 'G')) << 12n | BigInt(`0x${importId[1]}`) << 8n | fromBase64(importId[2]);
	for (let i = 3; i < importId.length; i += 3) {
		data = data << 16n | BigInt(`0x${importId[i]}${importId[i + 1]}`) << 8n | fromBase64(importId[i + 2]);
	}
	const length = importId.length / 3;
	return extractEnigmaFromData(decrypt(data, length, true), length);
};

// Import an enigma using its id; used in the import tab, when clicking on links, and when the 'e' url parameter is set
const importEnigma = importId => {
	let setupEnigma;
	let doubles;
	if (importId[0] >= 'G' && importId[0] <= 'V') {
		const result = importDouble(importId);
		if (!result) {
			return false;
		}
		setupEnigma = {
			criteria: result.criteria,
			indexes: result.indexes,
		};
		doubles = result.doubles;
	} else {
		setupEnigma = importSingle(importId);
		if (!setupEnigma) {
			return false;
		}
	}
	setupEnigma.id = importId;
	setupEnigma.solution = null;
	// For each code accepted by the criterion that accepts fewer codes
	for (const s of setupEnigma.criteria[setupEnigma.criteria.reduce((a, c, i) => c.accepted.length < a.value ? {
		index: i,
		value: c.accepted.length,
	} : a, {
		index: -1,
		value: 5 * 5 * 5,
	}).index].accepted) {
		if (setupEnigma.criteria.every(c => c.accepts[s])) {
			if (setupEnigma.solution !== null) {
				return showError(errorNoUniqueSolution);
			}
			setupEnigma.solution = s;
		}
	}
	if (setupEnigma.solution === null) {
		return showError(errorNoSolution);
	}
	// If a criterion does not reject at least a code that every other accept, it is redundand
	{
		const cs = setupEnigma.criteria;
		if (!cs.every(c => c.rejected.some(s => cs.every(c2 => c === c2 || c2.accepts[s])))) {
			return showError(errorRedundand);
		}
	}
	setup(setupEnigma, doubles);
	return true;
};

// Import an enigma, then add a new entry to the history of the browser as if a new page was visited
const importEnigmaAndPush = importId => {
	if (importEnigma(importId)) {
		history.pushState({
			enigma: importId,
		}, '', link.href);
	}
};

// Make clickable non-input elements not retain focus
for (const focusable of document.querySelectorAll('summary,a,input[type="checkbox"],button,dialog')) {
	focusable.onfocus = function() {
		this.blur();
	};
}

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
				getSelection().empty();
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
				create('legend', charSum('A', i)),
				append(
					addClasses(create('ul'), 'criteria'),
					...allVerifiers[exampleVerifiers[i]].map(c => create('li', c.description)),
				),
			),
		);
	}
}

// Make links to enigmas work without reloading the page
for (const enigmaLink of document.getElementsByClassName('enigma')) {
	onClick(
		enigmaLink,
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
	const base16 = newArray(16, i => i.toString(16).toUpperCase());
	const base16m = newArray(16, i => (i + 16).toString(32).toUpperCase());
	const base64 = newArray(64);

	for (let i = 0; i < 26; i += 1) {
		base64[i] = charSum('A', i);
		base64[26 + i] = charSum('a', i);
	}
	for (let i = 0; i < 10; i += 1) {
		base64[52 + i] = charSum('0', i);
	}
	base64[62] = '-';
	base64[63] = '.';

	// Sort the criteria, generate the ID and call setup
	const afterGenSingle = setupEnigma => {
		sort(setupEnigma.criteria, c => c.id);
		setupEnigma.indexes = setupEnigma.criteria.map(c => c.index);
		{
			let data = setupEnigma.criteria.reduce((a, c) => a << 8n | BigInt(c.id), 0n);
			data = encrypt(data, setupEnigma.criteria.length, false);
			setupEnigma.id = data.toString(16).toUpperCase().padStart(setupEnigma.criteria.length * 2, '0');
		}
		setup(setupEnigma);
	};

	// Add decoys, sort the criteria, generate the ID and call setup
	const afterGenDouble = (setupEnigma, difficult) => {
		{
			const {length} = difficult ? allVerifiers : easyVerifiers;
			mapInPlace(setupEnigma.criteria, criterion => {
				const incs = incompatibleDecoys[criterion.verifier];
				let decoy = Math.floor(Math.random() * (length - incs.length));
				// Skip incompatible decoys
				for (let i = 0; i < incs.length && decoy >= incs[i]; i += 1) {
					decoy += 1;
				}
				return {
					criterion,
					decoy,
				};
			});
		}
		sort(setupEnigma.criteria, c => Math.min(c.criterion.verifier, c.decoy));
		setupEnigma.indexes = newArray(setupEnigma.criteria.length);
		const doubles = newArray(setupEnigma.criteria.length);
		for (let i = 0; i < setupEnigma.criteria.length; i += 1) {
			const {criterion, decoy} = setupEnigma.criteria[i];
			if (criterion.verifier < decoy) {
				setupEnigma.indexes[i] = criterion.index;
				doubles[i] = allVerifiers[criterion.verifier].concat(allVerifiers[decoy]);
			} else {
				setupEnigma.indexes[i] = allVerifiers[decoy].length + criterion.index;
				doubles[i] = allVerifiers[decoy].concat(allVerifiers[criterion.verifier]);
			}
		}
		let data = 0n;
		for (const criterion of setupEnigma.criteria) {
			data = data << 16n | BigInt(criterion.criterion.id << 8 | criterion.decoy);
		}
		data = encrypt(data, setupEnigma.criteria.length, true);
		mapInPlace(setupEnigma.criteria, c => c.criterion);
		{
			const idArray = newArray(setupEnigma.criteria.length);
			for (let i = setupEnigma.criteria.length - 1; i; i -= 1) {
				const n = Number(data & 0xFFFFn);
				idArray[i] = `${base16[n >> 12]}${base16[n >> 8 & 0xF]}${base64[n & 0xFF]}`;
				data >>= 16n;
			}
			data = Number(data);
			idArray[0] = `${base16m[data >> 12]}${base16[data >> 8 & 0xF]}${base64[data & 0xFF]}`;
			setupEnigma.id = idArray.join('');
		}
		setup(setupEnigma, doubles);
	};

	// Optionally add decoys; then sort the criteria, generate the ID and call setup
	const afterGen = (setupEnigma, difficult, double) => {
		if (double) {
			afterGenDouble(setupEnigma, difficult);
		} else {
			afterGenSingle(setupEnigma);
		}
		// Add an entry in the history of the browser
		history.pushState({
			enigma: setupEnigma.id,
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
			const first = message.criteria[message.first];
			if (first.accepted.length > message.length - 1) {
				worker.postMessage(message);
				return message.first + 1;
			}
		}
		return -1;
	};

	// Used to create workers from a string containing the JavaScript code
	/* global generateString */
	const url = URL.createObjectURL(new Blob([generateString], {
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
		getSelection().empty();
		show(this.elements.cancel_button);
		const difficult = this.elements.difficult.checked;
		const double = this.elements.double.checked;
		// Shuffle criteria in random order
		const cs = mapInPlace(sort((difficult ? allCriteria : easyCriteria).map(item => ({
			item,
			score: Math.random(),
		})), c => c.score), c => c.item);
		const length = Number(this.elements.size.value);
		// The first criterion not yet assigned to a worker
		let first = 0;
		// If first === -1, all criteria has been assigned to workers
		for (let i = 0; i < workers.length && first !== -1; i += 1) {
			const worker = new Worker(url);
			worker.onmessage = function(message) {
				// If a worker sends a non-null message, it has generated an enigma
				if (message.data) {
					end();
					afterGen(message.data, difficult, double);
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
	};

	// Make it possible to cancel the generation
	onClick(
		document.forms.generate_form.elements.cancel_button,
		end,
	);
}

// Enable import button if and only if ID is valid
document.forms.import_form.elements.id.oninput = function() {
	document.forms.import_form.elements.import_button.disabled = !this.validity.valid;
};

// Import button imports the enigma with the ID
document.forms.import_form.onsubmit = function(event) {
	event.preventDefault();
	importEnigmaAndPush(this.elements.id.value);
};

// Click on the dialog close button
onClick(
	document.getElementById('close_button'),
	() => dialog.close(),
);

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
	questions.push({
		code: this.elements.code.value,
		verifier: this.elements.verifier.value,
	});
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
		if (enigma.criteria[this.elements.verifier.selectedIndex].accepts[code]) {
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
		document.forms.verify_form.elements.verify_button.disabled = !color(solutionTable, Math.min(...colors));
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
document.forms.verify_form.onsubmit = function(event) {
	event.preventDefault();
	gameOver = true;
	for (const verifier of verifiers.children) {
		for (const criterion of verifier.children[1].children) {
			criterion.classList.remove('clickable');
		}
	}
	document.forms.question_form.elements.question_button.disabled = true;
	for (let i = 0; i < enigma.indexes.length; i += 1) {
		const correct = verifiers.children[i].children[1].children[enigma.indexes[i]];
		addClasses(correct, 'correct');
		// If correct was deleted, -1; if it is guess, 1; if it is neither, 0
		const c = correct.classList.contains('deleted') ? -1 : correct.classList.contains('guess');
		color(verifiers.children[i], c);
	}
	{
		let guess = '';
		for (let i = 0; i < 3; i += 1) {
			for (let j = 0; j < solutionTBody.children.length; j += 1) {
				solutionTBody.children[j].children[i].classList.remove('clickable');
				if (solutionTBody.children[j].children[i].classList.contains('guess')) {
					guess += 5 - j;
				}
			}
		}
		this.elements.verify_button.disabled = true;
		if (guess === enigma.solution) {
			color(solutionTable, 1, true);
			color(this.elements.result, 1, true);
			this.elements.result.innerText = `Hai vinto in ${turns} turni e ${questions.length} interrogazioni!`;
		} else {
			color(solutionTable, -1, true);
			color(this.elements.result, -1, true);
			this.elements.result.innerHTML = `Hai perso! Il codice corretto è ${writeCode(enigma.solution)}.`;
		}
	}
	for (let i = 0; i < enigma.solution.length; i += 1) {
		addClasses(solutionTBody.children[5 - enigma.solution[i]].children[i], 'correct');
	}
	show(this.elements.result);
	this.elements.result.scrollIntoView({
		behavior: 'smooth',
		block: 'end',
	});
};

// Make animations reset so that it is possible to flash again on next game
makeAnimationReset(solutionTable);
makeAnimationReset(document.forms.verify_form.elements.result);

// Open the first tab
headers[0].open = true;

// If called with an e param, import its value as an enigma
{
	const e = new URLSearchParams(document.location.search).get('e');
	if (e && importEnigma(e)) {
		history.replaceState({
			enigma: e,
		}, '', link.href);
	} else {
		history.replaceState({}, '', document.location.pathname);
	}
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
