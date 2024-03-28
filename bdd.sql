DROP DATABASE IF EXISTS CinemaNode;
CREATE DATABASE CinemaNode;

USE CinemaNode;

CREATE TABLE salles (
    salle_id INT PRIMARY KEY AUTO_INCREMENT ,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100),
    capacity INT CHECK (capacity BETWEEN 15 AND 30),
    access_disabled BOOLEAN DEFAULT FALSE,
    maintenance_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE movies (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    genre VARCHAR(100)
);

CREATE TABLE showtimes (
    showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    salle_id INT REFERENCES salles(salle_id),
    movie_id INT REFERENCES movies(movie_id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    special_notes TEXT
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT REFERENCES showtimes(showtime_id),
    user_id INT REFERENCES users(user_id),
    status VARCHAR(50) NOT NULL,
    is_super BOOLEAN DEFAULT FALSE
);


CREATE TABLE super_ticket_accesses (
    access_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT REFERENCES tickets(ticket_id),
    showtime_id INT REFERENCES showtimes(showtime_id)
);

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT REFERENCES users(user_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    working_hours TEXT NOT NULL
);