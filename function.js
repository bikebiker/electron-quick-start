const elerem = require('electron').remote;
const dialog = elerem.dialog;
const app = elerem.app;

const request = require('request');
const EasyDl = require('easydl');
const path = require('path');
const log = require('./log.js');

const findFile = (url, uid, akey) => {
	const options = {
		uri: url,
		method: 'POST',
		body: {
			uid: uid,
			akey: akey,
		},
		json: true,
	};
	try {
		request.post(options, function (err, httpResponse, body) {
			console.log(err);
			console.log(httpResponse);
			console.log(body);
			log.updateLog('파일요청중...');
			if (!err && httpResponse.statusCode == 200) {
				//let jdata = JSON.parse(body);
				//console.log(jdata);

				if (body.success) {
					// app.getPath("desktop")       // User's Desktop folder
					// app.getPath("documents")     // User's "My Documents" folder
					// app.getPath("downloads")     // User's Downloads folder
					log.updateLog(`다운로드 준비.`);
					try {
						(async () => {
							let toLocalPath = path.resolve(app.getPath('downloads'), path.basename(body.fileUrl));
							let userChosenPath = dialog.showSaveDialogSync({ defaultPath: toLocalPath });
							if (userChosenPath) {
								log.updateLog(`다운로드 시작: ${body.fileUrl}`);
								const dl = new EasyDl(body.fileUrl, toLocalPath, {
									reportInterval: 1000,
								});
								await dl
									.on('progress', ({ details, total }) => {
										console.log(details);
										log.updateLog(
											`진행율: + ${Math.floor(total.percentage)}% (${Math.floor(
												total.bytes / 1024 / 1024
											)}MB)`
										);
									})
									.wait();
								updateHit('http://cabin.iooo.pw:3000/file/hit', uid, akey);
							}
						})();
					} catch (e) {
						console.log('[error', e);
					}
				} else {
					log.updateLog(`메시지: ${body.msg}`);
				}
			} else {
				log.updateLog(err);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

const updateHit = (url, uid, akey) => {
	const options = {
		uri: url,
		method: 'POST',
		body: {
			uid: uid,
			akey: akey,
		},
		json: true,
	};
	try {
		request.post(options, function (err, httpResponse, body) {
			console.log(err);
			console.log(httpResponse);
			console.log(body);
			log.updateLog('파일요청중...');
			if (!err && httpResponse.statusCode == 200) {
				if (body.success) {
					console.log('hit 업데이트');
					log.updateLog(`다운로드 완료 (${body.hit}회)`);
				} else {
					log.updateLog(`다운로드 완료`);
				}
			} else {
				log.updateLog(err);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

const startDownload = () => {
	let url = document.querySelector('#url').value;
	let uid = document.querySelector('#uid').value;
	let akey = document.querySelector('#akey').value;

	findFile(url, uid, akey);
};
