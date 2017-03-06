#!/usr/bin/env node

"use strict";

/* import modules */
const os = require("os");
const fs = require("fs");
const https = require("https");
const dns = require("dns");
const readline = require("readline");

/* change filenames here if appropriate */
var filenameOne = "airgeddon.sh";
var filenameTwo = "language_strings.sh";
var filenameThree = "known_pins.db";

/* raw github URLs */
var airgeddon_raw="https://raw.githubusercontent.com/v1s1t0r1sh3r3/airgeddon/master/" + filenameOne;
var langstrings_raw="https://raw.githubusercontent.com/v1s1t0r1sh3r3/airgeddon/master/" + filenameTwo;
var pindb_raw="https://raw.githubusercontent.com/v1s1t0r1sh3r3/airgeddon/master/" + filenameThree;

/* check OS */
function checkOS() {
  if (os.platform() !== "linux") {
    console.error("\x1b[41m\x1b[37m%s\x1b[0m", "airgeddon requires linux to run");
    process.exit(1);
  }
}

/*
 *  check internet connection
 *  TODO: cannot resolve host does not mean no connection :)
 */
function checkConnection(host) {
  dns.resolve(host, function(err) {
    if (err) {
      console.error("\x1b[41m\x1b[37m%s\x1b[0m", "No internet connection");
      process.exit(1);
    }
  });
}

/* check if write permissions exist */
function canWrite(path, callback) {
  fs.access(path, fs.W_OK, function(err) {
    callback(null, !err);
  });
}

/* appropriate checks, handling, creating dirs, prepare for download */
function fsHandle() {
  /* create I/O interface */
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  /* validate input, dirs, and handle fs */
  rl.question("Insert the directory to store airgeddon and press [ENTER]: ", (path) => {
    if (path === "") {
      canWrite("./", function(err, isWritable) {
        if (isWritable) {
          if (!fs.existsSync("./airgeddon/")) {
            process.stdout.write("\r\x1b[K");
            process.stdout.write("\x1b[32mCreating directory...\r\x1b[0m");
            fs.mkdirSync("./airgeddon/");
          }
          download(
            "./airgeddon/" + filenameOne,
            "./airgeddon/" + filenameTwo,
            "./airgeddon/" + filenameThree
          );
        } else {
          console.error("\x1b[41m\x1b[37m%s\x1b[0m", "No write permissions, run as root");
        }
      });
    } else if (path.slice(-1) === "/") {
      if (fs.existsSync(path)) {
        canWrite(path, function(err, isWritable) {
          if (isWritable) {
            if (!fs.existsSync(path + "airgeddon/")) {
              process.stdout.write("\r\x1b[K");
              process.stdout.write("\x1b[32mCreating directory...\r\x1b[0m");
              fs.mkdirSync(path + "airgeddon/");
            }
            download(
              path + "airgeddon/" + filenameOne,
              path + "airgeddon/" + filenameTwo,
              path + "airgeddon/" + filenameThree
            );
          } else {
            console.error("\x1b[41m\x1b[37m%s\x1b[0m", "No write permissions, run as root");
          }
        });
      }
    } else {
      if (fs.existsSync(path)) {
        canWrite(path, function(err, isWritable) {
          if (isWritable) {
            if (!fs.existsSync(path + "/airgeddon/")) {
              process.stdout.write("\r\x1b[K");
              process.stdout.write("\x1b[32mCreating directory...\r\x1b[0m");
              fs.mkdirSync(path + "/airgeddon/");
            }
            download(
              path + "/airgeddon/" + filenameOne,
              path + "/airgeddon/" + filenameTwo,
              path + "/airgeddon/" + filenameThree
            );
          } else {
            console.error("\x1b[41m\x1b[37m%s\x1b[0m", "No write permissions, run as root");
          }
        });
      }
    }

    /* close the I/O interface */
    rl.close();
  });
}

/* download required files */
function download(pathOne, pathTwo, pathThree) {

  /* allocate streams for files */
  var airgeddon = fs.createWriteStream(pathOne);
  var langstrings = fs.createWriteStream(pathTwo);
  var pindb = fs.createWriteStream(pathThree);
  
  https.get(airgeddon_raw, function(response) {
    response.pipe(airgeddon);
  });

  https.get(langstrings_raw, function(response) {
    response.pipe(langstrings);
  });

  https.get(pindb_raw, function(response) {
    response.pipe(pindb);
  });

  process.stdout.write("\r\x1b[K");
  process.stdout.write("\x1b[32mDownloading...\x1b[0m\r");
}

/* init program */
function init() {
  checkOS();
  checkConnection("www.google.com");
  fsHandle();
}

module.exports.init = init();
