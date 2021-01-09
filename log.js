const update = (objId, txt) => {
  let area = document.getElementById(objId);
  area.innerHTML = txt;
};

const clearLog = (objId) => {
  let area = document.getElementById(objId);
  area.innerHTML = "";
};

module.exports = {
  update: update,
  clearLog: clearLog,
};
