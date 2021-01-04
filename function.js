let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

const downloadImage = (path, url, titleId, no, retryCount) => {
	request(
		{
			url: url,
			headers: { referer: `https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${no}` },
			encoding: null,
		},
		function (error, response, body) {
			if (error && --retryCount >= 0) {
				console.log(`재시도 ${titleId} ${no} ${retryCount}`);
				downloadImage(path, url, titleId, no, retryCount);
				return;
			}
			fs.writeFile(path + '\\' + `${titleId}_${no}_${url.split('_IMAGE01_')[1]}`, body, null, (err) => {
				if (err) throw err;
				console.log('The file has been saved!');
			});
		}
	);
};

const getImageUrls = (titleId, no, path, nidAut, nidSes) => {
	let j = request.jar();
	let cookie1 = request.cookie(`NID_AUT=${nidAut}`);
	let cookie2 = request.cookie(`NID_SES=${nidSes}`);
	let url = 'https://comic.naver.com';
	j.setCookie(cookie1, url);
	j.setCookie(cookie2, url);

	request(
		{ url: `https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${no}`, jar: j },
		function (error, response, body) {
			console.log(response);
			const $ = cheerio.load(body);
			for (let i = 0; i < $('.wt_viewer img').length; i++)
				downloadImage('download', $('.wt_viewer img')[i].attribs.src, titleId, no, 5);
		}
	);
};

const startDownload = () => {
	let downloadKey = document.querySelector('#downloadKey').value;

	for (let i = 131, j = 0; i <= 131; i++, j++) {
		setTimeout(() => {
			getImageUrls(titleId, i, path, nidAut, nidSes);
		}, j * 1000);
	}

	return false;
};
