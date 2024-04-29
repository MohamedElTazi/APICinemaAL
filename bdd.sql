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
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'administrator') NOT NULL,
    balance FLOAT DEFAULT 0.0
);

CREATE TABLE ticket (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    is_super BOOLEAN NOT NULL,
    price INT NOT NULL, 
    nb_tickets INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE ticket_showtime_accesses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticketId INT NOT NULL,
    showtimeId INT NOT NULL,
    FOREIGN KEY (ticketId) REFERENCES ticket(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (showtimeId) REFERENCES showtime(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE transaction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    ticketId INT,
    transaction_type ENUM('buy ticket', 'recharge balance', 'withdraw balance') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ticketId) REFERENCES ticket(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE employee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    id_poste INT NULL,
    working_hours TEXT NOT NULL
);

CREATE TABLE poste (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
);
