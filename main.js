#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "${0}" "${@}"

"use strict";

/**
 * Dependencies
 */
/* just files */
const pkgjson = require('./package.json');
/* native modules */
const fs = require("fs");
const https = require("https");
const readline = require("readline");
/* extra modules */
const isOnline = require("is-online");
const ora = require("ora");
const chalk = require("chalk");
const github = require("github-api");
const whoami = require("username");

/* arguments */
var args = process.argv.slice(2);

/* color theme */
const error = chalk.bgRed.bold.white;
const warning = chalk.bold.yellow;
const extra = chalk.bgMagenta.bold.white;
const info = chalk.bold.underline.cyan;
const emphasis = chalk.bold.underline.green;
const highlight = chalk.bold.bgGreen.black;

/* github info */
const github_raw = "https://raw.githubusercontent.com";
const username = "v1s1t0r1sh3r3";
const project = "airgeddon";
var branch = "master";
var availableBranches = [];

/* filenames are located here */
var filenameOne = "airgeddon.sh";
var filenameTwo = "language_strings.sh";
var filenameThree = "known_pins.db";
var filenameFour = "README.md";
var filenameFive = "LICENSE.md";

/* raw github URLs */
var airgeddon_raw,
    langstrings_raw,
    pindb_raw,
    readme_raw,
    license_raw;

/* sanity */
var customBranch = false;

/**
 * Starts the script. Handle function calls based on args.
 * @return {[boolean]} Returns true.
 */
function init() {
    switch (args[0]) {
        case undefined:
            isOnline().then(online => {
                if (online) {
                    updateRawFiles();
                    prepare();
                } else {
                    console.error(error("No Internet connection"));
                    process.exit(1);
                }
            });
            break;
        case "-b":
        case "--branch":
            switch (args[1]) {
                default:
                    isOnline().then(online => {
                        if (online) {
                            getRepoBranches(username, project);
                            var i,
                                branchesString = "",
                                interval = setInterval(function() {
                                    if (availableBranches.length > 0) {
                                        clearInterval(interval);
                                        for (i = 0; i < availableBranches.length; i++)
                                            branchesString += availableBranches[i] + ", ";
                                        console.log("Available branches: " + extra(branchesString.replace(/,\s*$/, "")));
                                        insertBranch();
                                    }
                                }, 10);
                            var intervalTwo = setInterval(function() {
                                if (customBranch) {
                                    clearInterval(intervalTwo);
                                    updateRawFiles();
                                    prepare();
                                }
                            }, 10);
                        } else {
                            console.error(error("No Internet connection"));
                            process.exit(1);
                        }
                    });
                    break;
            }
            break;
        case "-v":
        case "--version":
            console.log(" " + pkgjson.name + info(" v." + pkgjson.version));
            break;
        case "-h":
        case "--help":
            usage();
            process.exit(0);
            break;
        default:
            console.log("\n" +
                " Invalid option " +
                "\"" + error(args[0]) + "\"");
            usage();
            process.exit(1);
    }
    return true;
}

/**
 * Prints usage aka. help message.
 * @return {[boolean]} Returns true.
 */
function usage() {
    console.log("\n" +
        " Version: " + info(pkgjson.version) + " Usage: " + pkgjson.name + " [options]" + "\n" + "\n" +
        " " + emphasis("Download airgeddon required files from github") + "\n" + "\n" +
        " Options:" + "\n" + "\n" +
        "  -h, --help" + "\t" + "output usage information" + "\n" +
        "  -v, --version" + "\t" + "output the version number" + "\n" +
        "  -b, --branch" + "\t" + "output available branches and specify from which one to download" + "\n" + "\n");
    return true;
}

/**
 * Checks if a path is writable. aka. Checks for write permissions.
 * @param  {[string]} path The path to check.
 * @param  {Function} callback -_-
 * @return {[boolean]} Just returns true.
 */
function canWrite(path, callback) {
    fs.access(path, fs.W_OK, function(err) {
        callback(null, !err);
    });
    return true;
}

/**
 * Returns a new github API object.
 * @return {[GitHub]} Read github-api documentation.
 */
function newGitApi() {
    return new github();
}

/**
 * Prints all available branches of a github repository.
 * Updates availableBranches array too.
 * @param {[string]} userName github username
 * @param {[string]} projectName github project
 * @return {[boolean]} Returns true.
 */
function getRepoBranches(userName, projectName) {
    const api = newGitApi();
    const repo = api.getRepo(userName, projectName);
    var i,
        branchesString = "";
    repo.listBranches(function(err, branches) {
        if (err) {
            console.error(error("Failed to list branches"));
            process.exit(1);
        }
        for (i = 0; i < branches.length; i++)
            availableBranches.push(branches[i].name);
        }
    );

    return true;
}

/**
  * Insert the preffered branch. Validations and chekcs are done.
  * @return {[boolean]} Returns true.
  */
function insertBranch() {
    /* create I/O interface */
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});

    rl.question("Insert preferred branch and press [ENTER]: ", (input) => {
        if (availableBranches.indexOf(input) > -1) {
            branch = input;
            customBranch = true;
        } else if (input === "") {
            branch = "master";
            customBranch = true;
        } else {
            console.error(error("Branch " +
                "\"" + input + "\"" + " does not exist!"));
            process.exit(1);
        }

        /* close the I/O interface */
        rl.close();
    });

    return true;
}

/**
 * Updates raw github URLs for required files.
 * @return {[boolean]} Just returns true.
 */
function updateRawFiles() {
    airgeddon_raw = github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameOne;
    langstrings_raw = github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameTwo;
    pindb_raw = github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameThree;
    readme_raw = github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameFour;
    license_raw = github_raw + "/" + username + "/" + project + "/" + branch + "/" + filenameFive;

    return true;
}

/**
 * Handles directories-files creation, I/O via readline interface.
 * @return {[boolean]} Returns true.
 */
function prepare() {
    /* create I/O interface */
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    /* validate input, dirs, and handle fs */
    rl.question("Insert directory and press [ENTER]: ", (path) => {
        if (path === "") {
            canWrite("./", function(err, isWritable) {
                if (err) console.error(error("No write permissions, run as root"));
                if (isWritable) {
                    if (!fs.existsSync("./airgeddon/"))
                        fs.mkdirSync("./airgeddon/");
                    download("./airgeddon/" + filenameOne, "./airgeddon/" + filenameTwo, "./airgeddon/" + filenameThree, "./airgeddon/" + filenameFour, "./airgeddon/" + filenameFive);
                }
            });
        } else if (path.charAt(0) === "~") {
            var fixedPath = "/home/" + whoami.sync() + "/";
            if (fs.existsSync(fixedPath)) {
                canWrite(fixedPath, function(err, isWritable) {
                    if (err) console.error(error("No write permissions, run as root"));
                    if (isWritable) {
                        if (!fs.existsSync(fixedPath + "airgeddon/"))
                            fs.mkdirSync(fixedPath + "airgeddon/");
                        download(fixedPath + "airgeddon/" + filenameOne, fixedPath + "airgeddon/" + filenameTwo, fixedPath + "airgeddon/" + filenameThree, fixedPath + "airgeddon/" + filenameFour, fixedPath + "airgeddon/" + filenameFive);
                    }
                });
            }
        } else if (path.slice(-1) === "/") {
            if (fs.existsSync(path)) {
                canWrite(path, function(err, isWritable) {
                    if (err) console.error(error("No write permissions, run as root"));
                    if (isWritable) {
                        if (!fs.existsSync(path + "airgeddon/"))
                            fs.mkdirSync(path + "airgeddon/");
                        download(path + "airgeddon/" + filenameOne, path + "airgeddon/" + filenameTwo, path + "airgeddon/" + filenameThree, path + "airgeddon/" + filenameFour, path + "airgeddon/" + filenameFive);
                    }
                });
            }
        } else {
            if (fs.existsSync(path)) {
                canWrite(path, function(err, isWritable) {
                    if (err) console.error(error("No write permissions, run as root"));
                    if (isWritable) {
                        if (!fs.existsSync(path + "/airgeddon/"))
                            fs.mkdirSync(path + "/airgeddon/");
                        download(path + "/airgeddon/" + filenameOne, path + "/airgeddon/" + filenameTwo, path + "/airgeddon/" + filenameThree, path + "/airgeddon/" + filenameFour, path + "/airgeddon/" + filenameFive);
                    }
                });
            }
        }
        /* close the I/O interface */
        rl.close();
    });
    return true;
}

/**
 * Downloads appropriate files from github.
 * Using spinners to indicate progress.
 * @param  {[string]} f First file.
 * @param  {[string]} i Second file.
 * @param  {[string]} l Third file.
 * @param  {[string]} e Fourth file.
 * @param  {[string]} s Fifth file.
 * @return {[boolean]} Returns true.
 */
function download(f, i, l, e, s) {
    /* create spinners with proper messages */
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

    return true;
}

/* export the module / start */
module.exports = init();
