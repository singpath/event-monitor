# Event monitor

[![Build Status](https://travis-ci.org/singpath/event-monitor.svg?branch=master)](https://travis-ci.org/singpath/event-monitor)

Monitors event participant solution and updates their progress


## Requirements

- nodejs 4+ (you can use nvm to install and switch between nodejs versions).
- npm version 3.

on OS X:
```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
exec -l $SHELL
nvm install 4
npm install npm -g
```

If you run `nvm use 4`, you would now see something like that:
```
$ nvm use 4
Now using node v4.x.x (npm v3.x.x)
```

## Setup

```shell
git clone https://github.com/singpath/event-monitor.git
cd event-monitor
nvm install
```

## Running monitor

To monitor the event owned by "bob", would run (replacing xxxx by the firebase
auth secret):
```shell
./bin/singpath-event-monitor
    --firebase-id singpath \
    --firebase-secret xxxxx
    --event-public-id EVENT_OWNER_PUBLIC_ID
```

## Usage

```
$ ./bin/singpath-event-monitor --help
usage: singpath-event-monitor [-h] [-v] [-d] [--debug-firebase] [-s] [-i ID]
                              [-a SECRET] [-p ID] [--list-only]


Monitor event participants solution to update their progress

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -d, --debug           print debug messages
  --debug-firebase      print firebase rules debug messages
  -s, --silent          print only error messages
  -i ID, --firebase-id ID
                        ID of of the firebase DB to watch
                        (default: singpath-play)
  -a SECRET, --firebase-secret SECRET
                        Firebase auth secret
                        (default: xxxx)
  -p ID, --event-public-id ID
                        Owner of the events to watch
                        (default: dino)
  --list-only           print only events that would be watched.

Environment variables:
  SINGPATH_FIREBASE_ID        ID of of the firebase DB to watch.
  SINGPATH_FIREBASE_SECRET    Firebase auth secret.
  SINGPATH_EVENT_PUBLIC_ID    Owner's Public id of the events to watch.

Config:
  You can set the default values with a JSON file named './.singpatheventmonitorrc' in your
  working directory.

  Example:

    {
      "firebaseId": "my-db",
      "firebaseSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "eventPublicId": "bob"
    }
```

## TODO

1. Add logging messages;
2. update ranking;
3. update all participant progress and ranking every hours (in case some student
   forget to report new badges);
4. add docker image.
