# Firebase/Stripe Powered Ordering Example

A small 'app' demonstrating a very simple payment flow powered by [firebase][1]
and [stripe][1]

## Structure

## Installation
run `yarn install` or `npm install` depending on preference to install all
dependencies. In addition, an environment variable file should be added to
`./.env` and a firebase specific config file should be added to
`./firebase/creds.json`

## Tests
Running `npm run test` should run the full test suite.

## Run Server
run `npm run serve` should fire up the server and listen for relevant updates on
the firebase instance.

## Run Dev Server With Simple UI
run `npm run dev` should do everything that `npm run serve` does, but also spin
up a small express web server with a (very, very) simple vue.js based UI to
allow execution of a dummy payment.

## Todos
- [ ] Definitely
  - [ ] Tests
  - [ ] Structure in README
  - [ ] .env file clearout
  - [ ] env vars for vue app!!
- [ ] Maybe
  - [ ] JSDoc
  - [ ] glob the listeners/handlers


[0]:[https://firebase.google.com/]
[1]:[https://stripe.com/gb]

