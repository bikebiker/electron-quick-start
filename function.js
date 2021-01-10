const { shell } = require("electron");
const elerem = require("electron").remote;
const dialog = elerem.dialog;
const app = elerem.app;

const request = require("request");
const EasyDl = require("easydl");
const path = require("path");
const log = require("./log.js");
const fs = require("fs");
//const clean = require("easydl/utils");
//import { clean } from "./node_modules/easydl/dist//utils";

let dlObj = null;
let fileUrl = null;
let userChosenPath = null;

const findFile = (url, uid, akey) => {
  const options = {
    uri: url,
    method: "POST",
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
      if (!err && httpResponse.statusCode == 200) {
        if (body.success) {
          let toLocalPath = path.resolve(app.getPath("downloads"), path.basename(body.fileNm));
          fileUrl = body.fileUrl;
          userChosenPath = dialog.showSaveDialogSync({
            defaultPath: toLocalPath,
          });

          if (userChosenPath) {
            log.update("fileName", path.basename(userChosenPath));
            progressDownload(fileUrl, userChosenPath);
          } else {
            log.update("etcMsg", `다운로드 취소`);
          }
        } else {
          log.update("fileName", `메시지: ${body.msg}`);
        }
      } else {
        console.log(err);
        log.update("fileName", `메시지: ${body.msg}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const progressDownload = (fileUrl, userChosenPath) => {
  Array.from(document.querySelectorAll(".btn-group")).forEach((element) => {
    element.classList.add("hide");
  });

  try {
    (async () => {
      console.log(`다운로드 시작: ${fileUrl}`);
      const dl = new EasyDl(fileUrl, userChosenPath, {
        reportInterval: 1000,
        existBehavior: "overwrite",
      });
      dlObj = dl;
      document.getElementById("stat-2").classList.remove("hide");

      dl.on("metadata", (metadata) => {
        console.log("[metadata]", metadata);
        log.update("fileSize", (metadata.size / 1024 / 1024).toFixed(2));
      }).on("progress", ({ details, total }) => {
        console.log("[details]", details);
        console.log("[total]", total);
        let progressBarObj = document.getElementById("progressbar");
        progressBarObj.style.width = total.percentage.toFixed() + "%";
        log.update("downPercent", `${total.percentage.toFixed(1)}%`);
        log.update("downSize", `${(total.bytes / 1024 / 1024).toFixed(2)} MB`);
      });

      const completed = await dl.wait();
      Array.from(document.querySelectorAll(".btn-group")).forEach((element) => {
        element.classList.add("hide");
      });
      if (completed) {
        log.update("etcMsg", `저장 완료.`);
        document.getElementById("stat-4").classList.remove("hide");
      } else {
        log.update("etcMsg", `다운로드 중지.`);
        document.getElementById("stat-3").classList.remove("hide");
      }
    })();
  } catch (e) {
    console.log("[error", e);
  }
};

const updateHit = (url, uid, akey) => {
  const options = {
    uri: url,
    method: "POST",
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

      if (!err && httpResponse.statusCode == 200) {
        if (body.success) {
          console.log("hit 업데이트");
          log.update("etcMsg", `${body.hit}회 다운로드`);
        } else {
          log.update("etcMsg", `다운로드 완료`);
          deleteParts();
        }
      } else {
        log.update("etcMsg", err);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const startDownload = () => {
  let url = document.querySelector("#url").value;
  let uid = document.querySelector("#uid").value;
  let akey = document.querySelector("#akey").value;

  if (url && uid && akey) {
    findFile(url, uid, akey);
  }
};
const pauseDownload = () => {
  dlObj.destroy();
  Array.from(document.querySelectorAll(".btn-group")).forEach((element) => {
    element.classList.add("hide");
  });
  document.getElementById("stat-3").classList.remove("hide");
  log.update("etcMsg", `다운로드 중지`);
};

const resumeDownload = () => {
  progressDownload(fileUrl, userChosenPath);
  log.update("etcMsg", `다운로드 시작`);
};

const cancelDownload = () => {
  if (dlObj) dlObj.destroy();
  deleteParts();
  initWindow();
};

const openFolder = () => {
  shell.showItemInFolder(userChosenPath);
};

const initWindow = () => {
  location.reload();
};

const deleteParts = () => {
  const parsed = path.parse(userChosenPath);
  const targetFile = parsed.base;
  const targetFolder = parsed.dir;
  fs.readdir(targetFolder, (err, files) => {
    if (err) throw err;
    const regex = /(.+)\.\$\$[0-9]+(\$PART)?$/;
    for (const file of files) {
      const cap = regex.exec(file);
      if (!cap || (targetFile !== null && cap[1] !== targetFile)) continue;

      fs.unlink(path.join(targetFolder, file), (err) => {
        if (err) throw err;
      });
    }
  });
};
