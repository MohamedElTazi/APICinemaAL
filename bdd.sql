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
    salleId INT NOT NULL,
    movieId INT NOT NULL,
    start_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    special_notes TEXT,
    FOREIGN KEY (salleId) REFERENCES salle(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (movieId) REFERENCES movie(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE user(
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'administrator', 'super_administrator') NOT NULL,
    balance FLOAT DEFAULT 0.0
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
    address VARCHAR(255),
    phone_number VARCHAR(20),
    status VARCHAR(50) NOT NULL
);

CREATE TABLE poste (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE planning (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employeeId INT NOT NULL REFERENCES employee(id),
    posteId INT NOT NULL REFERENCES poste(id),
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES employee(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (posteId) REFERENCES poste(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    userId INT REFERENCES user(id)
);