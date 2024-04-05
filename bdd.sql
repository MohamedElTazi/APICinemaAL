DROP DATABASE IF EXISTS CinemaNode;
CREATE DATABASE CinemaNode;

USE CinemaNode;

CREATE TABLE salle (
    salle_id INT PRIMARY KEY AUTO_INCREMENT ,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    capacity INT CHECK (capacity BETWEEN 15 AND 30),
    access_disabled BOOLEAN DEFAULT FALSE,
    maintenance_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE movie (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    genre VARCHAR(100)
);

CREATE TABLE showtime (
    showtime_id INT PRIMARY KEY AUTO_INCREMENT,
    salle_id INT REFERENCES salle(salle_id),
    movie_id INT REFERENCES movie(movie_id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    special_notes TEXT
);

CREATE TABLE user(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role ENUM('user', 'administrator') NOT NULL,
    balance INT DEFAULT 0
);

CREATE TABLE ticket (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT REFERENCES showtime(showtime_id),
    user_id INT REFERENCES user(user_id),
    status VARCHAR(50) NOT NULL,
    is_super BOOLEAN DEFAULT FALSE
);


CREATE TABLE super_ticket_accesse (
    access_id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT REFERENCES ticket(ticket_id),
    showtime_id INT REFERENCES showtime(showtime_id)
);

CREATE TABLE transaction (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT REFERENCES user(user_id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    working_hours TEXT NOT NULL
);

CREATE TABLE token (
    `token_id` INT AUTO_INCREMENT PRIMARY KEY,
    `token` VARCHAR(255) NOT NULL,
    `user_id` INT REFERENCES user(user_id)
);


