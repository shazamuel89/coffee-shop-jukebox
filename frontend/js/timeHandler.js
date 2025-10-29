const timeInput = document.getElementById("lengthLimit");

digits = []

function formatTime() {
    if (digits.length === 0) {
    	timeInput.value = '0:00';
	return;
    }

    if (digits.length <= 2) {
    	timeInput.value = '0:' + digits.join('').padStart(2, '0');
    } else {
    	const minutes = digits.slice(0, -2).join('').replace(/^0+/, '') || '0';
	const seconds = digits.slice(-2).join('').padStart(2, '0');
	timeInput.value = minutes + ':' + seconds;
    }
}

timeInput.addEventListener('paste', (e) => {
    e.preventDefault();
})

timeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
    	e.preventDefault();
	digits.pop();
	formatTime();
	return;
    }

    if (e.key.length === 1 && digits.length < 4 && /\d/.test(e.key)) {
    	e.preventDefault();
	digits.push(e.key);
	formatTime();
	return;
    }

    if (e.key !== 'Tab') { e.preventDefault(); }
});

timeInput.addEventListener('blur', () => {
    if (digits.length === 0) { return; }
    
    let minutes = 0, seconds = 0;
    if (digits.length <= 2) {
    	seconds = parseInt(digits.join(''), 10);
	if (seconds > 59) { seconds = 59; }
    } else {
	minutes = parseInt(digits.slice(0, -2).join(''), 10);
	seconds = parseInt(digits.slice(-2).join(''), 10);
	if (seconds > 59) { seconds = 59; }
    }

    digits = (minutes + (seconds < 10 ? '0' : '') + seconds).split('');
    formatTime();
});
