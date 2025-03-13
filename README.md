# Hotel Booking Backend - roomBooking_server

## 📌 Overview
 Node.js based server application that does the following,
1. User Authentication Via username/password
2. User Authentication via one time link
3. Get Time API
4. Kickout API

## 🛠 Technologies Used

Node.js

Express.js

TypeScript

Routing Controllers

PostgreSQL (Docker container)


## 🚀 Getting Started

✅ Prerequisites

Ensure you have the following installed:

Node.js

Docker

## 🏗 Setting Up the Database

Run the following command to start a PostgreSQL database in a Docker container:

```docker run --name postgressDB -p 5432:5432 -e POSTGRES_PASSWORD=root -d postgres```

## 📦 Installation

Clone the repository and install dependencies:

```git clone https://github.com/betaDev01/roomBooking_server.git```

```cd roomBooking_server```

```npm install```


## Database Migration

A migration query has been attached to create the necessary database tables and insert hotel-related data. Ensure you run the migration script before starting the backend service.

```sh 
File name: manualQuery
```

## ▶️ Running the Application

```npm start```

## 🔗 API Endpoints

Booking Operations CURL

Health Check
```sh
curl --location 'localhost:4000/health'
```

Create User
```sh
curl --location 'localhost:4000/auth/signUp' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test21@gail.com",
    "phoneNumber": "213456789",
    "password": "sample11",
    "confirmPassword": "sample11",
    "isAdmin": true
}'
```

SignIn 
```sh
curl --location 'localhost:4000/auth/signIn' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test21@gail.com",
    
    "password": "sample11"
    
}'
```

Update User configuration:
```sh
curl --location --request PUT 'localhost:4000/auth/update_attempts' \
--header 'Content-Type: application/json' \
--data '{
    "attemptsCount": 5,
    "linkValidUpto": 2
}'
```

Generate One time link
```sh
curl --location 'localhost:4000/auth/generate_temp_link' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test21@gail.com"
}'
```

Get Time
```sh
curl --location 'localhost:4000/get-time' \
--header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyM0BnYWlsLmNvbSIsInBob25lTnVtYmVyIjoiMjMzNDU2Nzg5IiwiaWF0IjoxNzQxODkxMTI2LCJleHAiOjE3NDE4OTQ3MjZ9.ieDJdek8HJNBf0DDguAWJ7Ck2Fr71Rcm37Q5oZVn1fY'
```

Kickout API
```sh
curl --location 'localhost:4000/kickout-user' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test21@gail.com"
}'
```
