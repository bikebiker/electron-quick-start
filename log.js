let logArea = document.getElementById('logArea');
const addLog = (message) => {
	logArea.innerHTML = logArea.innerHTML + '[INFO] - ' + `${message}\n`;
};

const addErrorLog = (errMessage) => {
	logArea.innerHTML = logArea.innerHTML + '[ERROR] - ' + `${errMessage}\n`;
};

const updateLog = (txt) => {
	logArea.innerHTML = txt;
};

const clearLog = () => {
	logArea.innerHTML = '';
};

module.exports = {
	addLog: addLog,
	addErrorLog: addErrorLog,
	updateLog: updateLog,
	clearLog: clearLog,
};
