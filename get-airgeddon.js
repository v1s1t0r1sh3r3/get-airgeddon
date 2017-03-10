#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "${0}" "${@}"

"use strict";

/* native modules */
const fs = require("fs");
const https = require("https");
const readline = require("readline");
/* extra modules */
const isOnline = require("is-online");
const ora = require("ora");
const program = require("commander");
/* just files */
const pkgjson = require('./package.json');

isOnline().then(online => {
  if (!online) {
    console.error("\x1b[41m\x1b[37m%s\x1b[0m", "No Internet connection");
    process.exit(1);
  }
});

program
  .version(pkgjson.version)
  .description(pkgjson.description)
  .option("-b, --branch [branch]", "specify from which branch to download", init)
  .parse(process.argv);

/* github info */
const github_raw = "https://raw.githubusercontent.com"
const username = "v1s1t0r1sh3r3";
const project = "airgeddon";
var branch = "master";
if (program.branch) branch = program.branch;

/* filenames are located here */
var filenameOne = "airgeddon.sh";
var filenameTwo = "language_strings.sh";
var filenameThree = "known_pins.db";
var filenameFour = "README.md";
var filenameFive = "LICENSE.md";

/* raw github URLs */
var airgeddon_raw =
  github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameOne;
var langstrings_raw =
  github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameTwo;
var pindb_raw =
  github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameThree;
var readme_raw =
  github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameFour;
var license_raw =
  github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameFive;

/* appropriate checks, handling, creating dirs, downloading the files */
function init() {
  /* create I/O interface */
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  /* validate input, dirs, and handle fs */
  rl.question("Insert directory and press [ENTER]: ", (path) => {
    if (path === "") {
      canWrite("./", function(err, isWritable) {
        if (isWritable) {
          if (!fs.existsSync("./airgeddon/")) {
            fs.mkdir("./airgeddon/", function (error) {
              if (error) {
                console.error("\x1b[41m\x1b[37m%s\x1b[0m", "Failed to create directory");
              }
            });
          }
          download(
            "./airgeddon/" + filenameOne,
            "./airgeddon/" + filenameTwo,
            "./airgeddon/" + filenameThree,
            "./airgeddon/" + filenameFour,
            "./airgeddon/" + filenameFive
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
              fs.mkdir("airgeddon/", function (error) {
                if (error) {
                  console.error("\x1b[41m\x1b[37m%s\x1b[0m", "Failed to create directory");
                }
              });
            }
            download(
              path + "airgeddon/" + filenameOne,
              path + "airgeddon/" + filenameTwo,
              path + "airgeddon/" + filenameThree,
              path + "airgeddon/" + filenameFour,
              path + "airgeddon/" + filenameFive
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
              fs.mkdir("/airgeddon/", function (error) {
                if (error) {
                  console.error("\x1b[41m\x1b[37m%s\x1b[0m", "Failed to create directory");
                }
              });
            }
            download(
              path + "/airgeddon/" + filenameOne,
              path + "/airgeddon/" + filenameTwo,
              path + "/airgeddon/" + filenameThree,
              path + "/airgeddon/" + filenameFour,
              path + "/airgeddon/" + filenameFive
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

/* check if write permissions exist */
function canWrite(path, callback) {
  fs.access(path, fs.W_OK, function(err) {
    callback(null, !err);
  });
}

/**
 *  download required files
 */
function download(f, i, l, e, s) {
  const spinnerOne = ora("Downloading " + filenameOne);
  const spinnerTwo = ora("Downloading " + filenameTwo);
  const spinnerThree = ora("Downloading " + filenameThree);
  const spinnerFour = ora("Downloading " + filenameFour);
  const spinnerFive = ora("Downloading " + filenameFive);

  setTimeout(function() {
    spinnerOne.start();
    var airgeddon = fs.createWriteStream(f);
    https.get(airgeddon_raw, function(response) {
      response.pipe(airgeddon);
    });
    spinnerOne.succeed("Downloaded " + filenameOne);
    spinnerTwo.start();
  }, 300);
  setTimeout(function() {
    var langstrings = fs.createWriteStream(i);
    https.get(langstrings_raw, function(response) {
      response.pipe(langstrings);
    });
    spinnerTwo.succeed("Downloaded " + filenameTwo);
    spinnerThree.start();
  }, 450);
  setTimeout(function() {
    var pindb = fs.createWriteStream(l);
    https.get(pindb_raw, function(response) {
      response.pipe(pindb);
    });
    spinnerThree.succeed("Downloaded " + filenameThree);
  }, 500);
  setTimeout(function() {
    var readme = fs.createWriteStream(e);
    https.get(readme_raw, function(response) {
      response.pipe(readme);
    });
    spinnerThree.succeed("Downloaded " + filenameFour);
  }, 600);
  setTimeout(function() {
    var license = fs.createWriteStream(s);
    https.get(license_raw, function(response) {
      response.pipe(license);
    });
    spinnerThree.succeed("Downloaded " + filenameFive);
  }, 650);
}
