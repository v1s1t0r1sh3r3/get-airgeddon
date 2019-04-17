#!/bin/sh
':'; //; exec "$(command -v nodejs || command -v node)" "${0}" "${@}"

'use strict';

// imports
const pkgjson = require('./package.json'),
  fs = require('fs'),
  https = require('https'),
  readline = require('readline'),
  isOnline = require('is-online'),
  ora = require('ora'),
  chalk = require('chalk'),
  github = require('github-api'),
  whoami = require('username');

// colors
const error = chalk.bgRed.bold.white,
  warning = chalk.bold.yellow,
  extra = chalk.bgMagenta.bold.white,
  info = chalk.bold.underline.cyan,
  emphasis = chalk.bold.underline.green,
  highlight = chalk.bold.bgGreen.black;

// github repo vars
const github_raw = 'https://raw.githubusercontent.com',
  username = 'v1s1t0r1sh3r3',
  project = 'airgeddon';

var branch = 'master',
  availableBranches = [],
  filenameOne = 'airgeddon.sh',
  filenameTwo = 'language_strings.sh',
  filenameThree = 'known_pins.db',
  filenameFour = 'README.md',
  filenameFive = 'LICENSE.md',
  filenameSix = '.airgeddonrc',
  airgeddon_raw,
  langstrings_raw,
  pindb_raw,
  readme_raw,
  license_raw,
  options_raw,
  customBranch = false,
  args = process.argv.slice(2);

function init () {
  switch (args[0]) {
    case undefined:
      isOnline().then(online => {
        if (online) {
          updateRawFiles();
          prepare()
        } else {
          console.error(error('No Internet connection'));
          process.exit(1)
        }
      });
      break;
    case '-b':
    case '--branch':
      isOnline().then(online => {
        if (online) {
          getRepoBranches(username, project);
          var i,
            branchesString = '',
            interval = setInterval(function () {
              if (availableBranches.length > 0) {
                clearInterval(interval);
                for (i = 0; i < availableBranches.length; i++) { branchesString += availableBranches[i] + ', ' }
                console.log('Available branches: ' +
                extra(branchesString.replace(/,\s*$/, '')));
                insertBranch()
              }
            }, 10);
          var intervalTwo = setInterval(function () {
            if (customBranch) {
              clearInterval(intervalTwo);
              updateRawFiles();
              prepare()
            }
          }, 10)
        } else {
          console.error(error('No Internet connection'));
          process.exit(1)
        }
      });
      break;
    case '-v':
    case '--version':
      console.log(' ' + pkgjson.name + ' ' + info('v' + pkgjson.version));
      break;
    case '-h':
    case '--help':
      usage();
      process.exit(0);
      break;
    default:
      console.log('\n' + ' Invalid option ' + '"' + error(args[0]) + '"');
      usage();
      process.exit(1)
  }
  return true
}

function usage () {
  console.log('\n' +
  ' Version: ' + info(pkgjson.version) + ' Usage: ' + pkgjson.name + ' [options]' + '\n' + '\n' +
  ' ' + emphasis('Download airgeddon required files from github') + '\n' + '\n' +
  ' Options:' + '\n' + '\n' +
  '  -h, --help' + '\t' + 'output usage information' + '\n' +
  '  -v, --version' + '\t' + 'output the version number' + '\n' +
  '  -b, --branch' + '\t' + 'output available branches and specify from which one to download' + '\n' + '\n');
  return true
}

function canWrite (path, callback) {
  fs.access(path, fs.W_OK, function (err) {
    callback(null, !err)
  });
  return true
}

function newGitApi () {
  return new github()
}

function getRepoBranches (userName, projectName) {
  const api = newGitApi();
  const repo = api.getRepo(userName, projectName);
  var i, branchesString = '';
  repo.listBranches(function (err, branches) {
    if (err) {
      console.error(error('Failed to list branches'));
      process.exit(1)
    }
    for (i = 0; i < branches.length; i++) { availableBranches.push(branches[i].name) }
  }
  );

  return true
}

function insertBranch () {
  /* create I/O interface */
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});

  rl.question('Insert preferred branch and press [ENTER]: ', (input) => {
    if (availableBranches.indexOf(input) > -1) {
      branch = input;
      customBranch = true
    } else if (input === '') {
      branch = 'master';
      customBranch = true
    } else {
      console.error(error('Branch ' + '"' + input + '"' + ' does not exist!'));
      process.exit(1)
    }

    /* close the I/O interface */
    rl.close()
  });

  return true
}

function updateRawFiles () {
  airgeddon_raw = github_raw + '/' + username + '/' + project + '/' + branch + '/' + filenameOne;
  langstrings_raw = github_raw + '/' + username + '/' + project + '/' + branch + '/' + filenameTwo;
  pindb_raw = github_raw + '/' + username + '/' + project + '/' + branch + '/' + filenameThree;
  readme_raw = github_raw + '/' + username + '/' + project + '/' + branch + '/' + filenameFour;
  license_raw = github_raw + '/' + username + '/' + project + '/' + branch + '/' + filenameFive;
  options_raw = github_raw + '/' + username + '/' + project + '/' + branch + '/' + filenameSix;

  return true
}

function prepare () {
  /* create I/O interface */
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  /* validate input, dirs, and handle fs */
  rl.question('Insert directory and press [ENTER]: ', (path) => {
    if (path === '') {
      canWrite('./', function (err, isWritable) {
        if (err) console.error(error('No write permissions, run as root'));
        if (isWritable) {
          if (!fs.existsSync('./airgeddon/')) { fs.mkdirSync('./airgeddon/') }
          download('./airgeddon/' + filenameOne,
                   './airgeddon/' + filenameTwo,
                   './airgeddon/' + filenameThree,
                   './airgeddon/' + filenameFour,
                   './airgeddon/' + filenameFive,
                   './airgeddon/' + filenameSix,
                  )
        }
      })
    } else if (path.charAt(0) === '~') {
      var fixedPath = '/home/' + whoami.sync() + '/';
      if (fs.existsSync(fixedPath)) {
        canWrite(fixedPath, function (err, isWritable) {
          if (err) console.error(error('No write permissions, run as root'));
          if (isWritable) {
            if (!fs.existsSync(fixedPath + 'airgeddon/')) { fs.mkdirSync(fixedPath + 'airgeddon/') }
            download(fixedPath + 'airgeddon/' + filenameOne,
                     fixedPath + 'airgeddon/' + filenameTwo,
                     fixedPath + 'airgeddon/' + filenameThree,
                     fixedPath + 'airgeddon/' + filenameFour,
                     fixedPath + 'airgeddon/' + filenameFive,
                     fixedPath + 'airgeddon/' + filenameSix,
                  )
          }
        })
      }
    } else if (path.slice(-1) === '/') {
      if (fs.existsSync(path)) {
        canWrite(path, function (err, isWritable) {
          if (err) console.error(error('No write permissions, run as root'));
          if (isWritable) {
            if (!fs.existsSync(path + 'airgeddon/')) { fs.mkdirSync(path + 'airgeddon/') }
            download(path + 'airgeddon/' + filenameOne,
                     path + 'airgeddon/' + filenameTwo,
                     path + 'airgeddon/' + filenameThree,
                     path + 'airgeddon/' + filenameFour,
                     path + 'airgeddon/' + filenameFive,
                     path + 'airgeddon/' + filenameSix,
                  )
          }
        })
      }
    } else {
      if (fs.existsSync(path)) {
        canWrite(path, function (err, isWritable) {
          if (err) console.error(error('No write permissions, run as root'));
          if (isWritable) {
            if (!fs.existsSync(path + '/airgeddon/')) { fs.mkdirSync(path + '/airgeddon/') }
            download(path + 'airgeddon/' + filenameOne,
                     path + 'airgeddon/' + filenameTwo,
                     path + 'airgeddon/' + filenameThree,
                     path + 'airgeddon/' + filenameFour,
                     path + 'airgeddon/' + filenameFive,
                     path + 'airgeddon/' + filenameSix,
                  )
          }
        })
      }
    }
    /* close the I/O interface */
    rl.close()
  });
  return true
}

function download (file1, file2, file3, file4, file5, file6) {
  /* create spinners with proper messages */
  const spinnerOne = ora('Downloading ' + filenameOne);
  const spinnerTwo = ora('Downloading ' + filenameTwo);
  const spinnerThree = ora('Downloading ' + filenameThree);
  const spinnerFour = ora('Downloading ' + filenameFour);
  const spinnerFive = ora('Downloading ' + filenameFive);
  const spinnerSix = ora('Downloading ' + filenameSix);

  setTimeout(function () {
    spinnerOne.start();
    var airgeddon = fs.createWriteStream(file1);
    https.get(airgeddon_raw, function (response) {
      response.pipe(airgeddon)
    });
    spinnerOne.succeed('Downloaded ' + filenameOne);
    spinnerTwo.start()
  }, 300);
  setTimeout(function () {
    var langstrings = fs.createWriteStream(file2);
    https.get(langstrings_raw, function (response) {
      response.pipe(langstrings)
    });
    spinnerTwo.succeed('Downloaded ' + filenameTwo);
    spinnerThree.start()
  }, 450);
  setTimeout(function () {
    var pindb = fs.createWriteStream(file3);
    https.get(pindb_raw, function (response) {
      response.pipe(pindb)
    });
    spinnerThree.succeed('Downloaded ' + filenameThree)
  }, 500);
  setTimeout(function () {
    var readme = fs.createWriteStream(file4);
    https.get(readme_raw, function (response) {
      response.pipe(readme)
    });
    spinnerThree.succeed('Downloaded ' + filenameFour)
  }, 600);
  setTimeout(function () {
    var license = fs.createWriteStream(file5);
    https.get(license_raw, function (response) {
      response.pipe(license)
    });
    spinnerThree.succeed('Downloaded ' + filenameFive)
  }, 650);
  setTimeout(function () {
    var license = fs.createWriteStream(file6);
    https.get(options_raw, function (response) {
      response.pipe(license)
    });
    spinnerThree.succeed('Downloaded ' + filenameSix)
  }, 700);

  return true
}

/* export the module / start */
module.exports = init();
