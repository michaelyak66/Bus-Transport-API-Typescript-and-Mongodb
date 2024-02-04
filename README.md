# way-farer-api
WayFarer is a public bus transportation booking server.


### Description
```
Way-Farer is a public transport booking server that bridges the gap between commuters and transporter and ticketing.

This helps save time at ticketing stands and stress of long queues.
```

### Prerequisites
- [NodeJS](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org)

### Technologies
- [NodeJS](https://nodejs.org)
- [ExpressJS](https://npmjs.com/package/express)
- [PG](https://node-postgres.com)
- [PostgreSQL](https://www.postgresql.org)

### Features
- User authentication `signup and signin`
- Create Bus
- Create Trip
- View Trips
- Cancel Trip
- Create Booking
- Get Bookings
- Delete Bookings
- Save seat number
- View booking

### Install Project
- clone project on local machine
- navigate into local repository by running `cd way-farer-api`
- create db using `createdb way-farer`
- create a .env file in root directory and fill it up using example in .env.example
- run `npm install`
- run `npm start`

### Test
API test is written with mocha and supertest. Frontend tests is written with jest and enzyme.
- clone project on local machine
- navigate into local repository by running `cd way-farer-api`
- create db using `createdb way-farer`
- create a .env file in root directory and fill it up using example in .env.example
- run `npm install`
- run `npm run test`

### How to contribute
- The project is open for contribution. You can start by forking this project repo. If you have improvements you want to add, feel free to do so and create a PR against develop branch

### Documentation
The API documentation for this project can be found [here](https://save-a-seat.herokuapp.com)

### License
[MIT](https://github.com/michaelyak66/Bus-Transport-API-Typescript-and-Postgres.git/blob/develop/LICENSE)
