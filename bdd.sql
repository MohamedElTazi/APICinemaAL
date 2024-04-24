DROP DATABASE IF EXISTS CinemaNode;
CREATE DATABASE CinemaNode;

USE CinemaNode;

CREATE TABLE salle (
    id INT PRIMARY KEY AUTO_INCREMENT ,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    capacity INT CHECK (capacity BETWEEN 15 AND 30),
    access_disabled BOOLEAN DEFAULT FALSE,
    maintenance_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE movie (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration TIME NOT NULL,
    genre VARCHAR(100)
);

CREATE TABLE showtime (
    id INT PRIMARY KEY AUTO_INCREMENT,
    salleId INT NOT NULL REFERENCES salle(id),
    movieId INT NOT NULL REFERENCES movie(id),
    start_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  
    end_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  
    special_notes TEXT
);

CREATE TABLE user(
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'administrator') NOT NULL,
    balance INT DEFAULT 0
);

CREATE TABLE ticket (
    id INT PRIMARY KEY AUTO_INCREMENT,
    showtimeId INT REFERENCES showtime(id),
    userId INT REFERENCES user(id),
    status VARCHAR(50) NOT NULL,
    is_super BOOLEAN DEFAULT FALSE
);


CREATE TABLE super_ticket_accesse (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticketId INT REFERENCES ticket(id),
    showtimeId INT REFERENCES showtime(id)
);

CREATE TABLE transaction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT REFERENCES user(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    working_hours TEXT NOT NULL
);

CREATE TABLE token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    userId INT REFERENCES user(id)
);


