# Firebase/Stripe Powered Ordering Example

A small 'app' demonstrating a very simple payment flow powered by [firebase][1]
and [stripe][1]

## Structure
The idea was to separate the logic for individual update listener into their own
files and initialise them on load allowing easy/tidy future expansion.

Libraries are wrapped in an attempt to reducde the pain of changing libraries in
the future and helper functions are provided where useful.

All modules export a function receiving deps as args, and return an
object/function. The deps are wrapped in the export closure to make testing less
painful.

## Installation
Run `yarn install` or `npm install` depending on package maneger preference.

### Environment Variables
There are two environment variable files which should be populated, `app/.env`
for generic env vars and `app/firebase/creds.json` for firebase creds.

## Tests
Running `npm run test` should run the full test suite.

## Run Server
run `npm run start` should fire up the server and listen for relevant updates on
the firebase instance.

## Run Dev Server With Simple UI
There's an optional dummy payment ui repo which allows completion of the
'orders' that this server expects. It's declared as a submodule.
Run `git submodule update --init` to install it and see the instructions in the
submodule README.md


[0]:[https://firebase.google.com/]
[1]:[https://stripe.com/gb]
