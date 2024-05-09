source C:\Users\tmoha\Desktop\APICinemaAL/bdd.sql

INSERT INTO salle (name, description, type, capacity, access_disabled, maintenance_status) VALUES
('Salle Rouge', "Une salle avec des sièges rouges confortables, idéale pour les films d\'amour.", "standard", 25, FALSE, FALSE),
('Salle Verte', 'Salle équipée pour les personnes à mobilité réduite.', 'accessible', 20, TRUE, FALSE),
('Salle Bleue', 'Une petite salle cosy pour des projections privées.', 'privée', 15, FALSE, TRUE),
('Salle Jaune', 'Salle lumineuse et spacieuse pour des conférences.', 'standard', 30, FALSE, FALSE),
('Salle Noire', 'Salle optimisée pour des projections cinématographiques de qualité supérieure.', 'premium', 30, FALSE, FALSE),
('Salle Blanche', 'Salle multi-usage, parfaite pour des événements variés.', 'standard', 15, TRUE, FALSE),
('Salle Orange', 'Ambiance chaleureuse, idéale pour des spectacles en direct.', 'spectacle', 15, FALSE, TRUE),
('Salle Grise', 'Design moderne, pour des rencontres professionnelles.', 'conférence', 16, TRUE, FALSE),
('Salle Cyan', 'Petite et intime, parfaite pour des sessions de groupe restreint.', 'privée', 15, FALSE, FALSE),
('Salle Magenta', 'Décor vibrant, adaptée pour des fêtes privées et des célébrations.', 'festive', 23, FALSE, TRUE),
('Salle Argent', 'Équipement de pointe pour une acoustique impeccable.', 'premium', 24, FALSE, FALSE),
('Salle Or', 'Luxueuse et spacieuse, avec des sièges VIP.', 'vip', 30, FALSE, FALSE);
-- Insertion dans la table movie
INSERT INTO movie (title, description, duration, genre) VALUES
("Les Aventures de Tintin", "Tintin et Milou partent à la recherche du trésor perdu.", "02:00:00", "Aventure"),
("Amélie Poulain", "La vie quoditienne d\'Amélie, une jeune femme parisienne.", "02:02:00", "Comédie"),
("Interstellar", "Un voyage à travers l\'espace pour sauver l\'humanité.", "02:53:28", "Science-Fiction"),
("Blade Runner", "Un chasseur de primes traque des androïdes fugitifs dans un futur dystopique.", "01:57:00", "Science-Fiction"),
("La La Land", "L'histoire d'amour entre une actrice en devenir et un musicien de jazz.", "02:08:00", "Musical"),
("Gladiator", "Un général romain trahi se transforme en gladiateur pour venger la mort de sa famille.", "02:35:00", "Historique");

-- Insertion dans la table showtime
INSERT INTO showtime (salleId, movieId, start_datetime, end_datetime, special_notes) VALUES
(1, 1, '2024-03-10 14:00:00', '2024-03-10 16:00:00', ''),
(2, 2, '2024-05-10 17:00:00', '2024-05-10 19:00:00', 'Séance avec sous-titres pour sourds et malentendants'),
(3, 3, '2024-05-11 19:00:00', '2024-05-11-20:00:00', ''),
(4, 4, '2024-06-01 18:00:00', '2024-06-01 20:00:00', 'Projection en 4K'),
(5, 5, '2024-06-15 19:30:00', '2024-06-15 21:45:00', 'Séance avec orchestre live'),
(6, 6, '2024-07-20 21:00:00', '2024-07-20 23:45:00', ''),
(1, 1, '2024-07-20 19:20:00', '2024-07-20 21:20:00', '');


INSERT INTO user (firstname, lastname,email, password, role, balance) VALUES
('Antoine', 'Dufour','user1@example.com', '$2b$10$LKHQLFbLHw7md6jS9UIbxOGRVUV.c/4skjqzhPuEOdgHxqhvgaC2W', 'user', 100), /* password: password1 */
('Mehdi','Bellil','admin@example.com', '$2b$10$ZoAnhqUHS7sShkq/7fLS9.2iTlQ.z./yIAThCiNPj7vLWlrVsLDv6', 'administrator', 0), /* password: password2 */
('Ines','Zemouche','user2@example.com', '$2b$10$lf2XD4g1HRdAK2Zy6DZj.uZOsIz4eiAIcG0fo5716A6JayQO6FOLa', 'user', 50), /* password: password3 */
('Hamadou','Diakite','user4@example.com', '$2b$10$IOHz6oO7lOEsl9KQH8lZ4ukaPCJ.TEgGyz7gsJWE32AUiTUtLdZa2', 'user', 60), /* password: azertyyy */
('Rayan','Marlet','user5@example.com', '$2b$10$IOHz6oO7lOEsl9KQH8lZ4ukaPCJ.TEgGyz7gsJWE32AUiTUtLdZa2', 'user', 30), /* password: azertyyy */
('Boume','Bennali','user6@example.com', '$2b$10$IOHz6oO7lOEsl9KQH8lZ4ukaPCJ.TEgGyz7gsJWE32AUiTUtLdZa2', 'user', 90), /* password: azertyyy */
('Theophile','Bourget','user7@example.com', '$2b$10$IOHz6oO7lOEsl9KQH8lZ4ukaPCJ.TEgGyz7gsJWE32AUiTUtLdZa2', 'user', 65); /* password: azertyyy */

-- Insertion dans la table ticket
INSERT INTO ticket (userId, is_used, is_super,price ,nb_tickets) VALUES
(1, FALSE, FALSE, 10,1),
(3, FALSE, FALSE, 10,1),
(4, FALSE, FALSE, 10, 0),
(5, FALSE, TRUE, 80, 9),
(4, FALSE, TRUE, 80 ,6),
(3, TRUE, FALSE, 10,0),
(6, TRUE, FALSE, 10, 0),
(7, TRUE, FALSE, 10, 0),
(6, FALSE, TRUE, 80, 5),
(7, FALSE, TRUE, 80, 4);

-- Insertion dans la table ticket_showtime_accesses
INSERT INTO ticket_showtime_accesses (ticketId, showtimeId) VALUES
(4, 1),
(4, 7),
(5, 1),
(5, 1),
(9, 1),
(5, 2),
(5, 3),
(6, 4),
(7, 5),
(8, 6);

-- Insertion dans la table transaction
INSERT INTO transaction (userId, amount, transaction_type, transaction_date) VALUES
(2, 50.00, 'recharge balance', '2024-04-09 10:30:00'),
(3, 20.00, 'withdraw balance', '2024-04-10 15:00:00'),
(5, 45.00, 'recharge balance', '2024-06-02 11:00:00'),
(6, 30.00, 'withdraw balance', '2024-06-03 14:30:00');

INSERT INTO transaction (userId, ticketId, transaction_type, amount, transaction_date) VALUES
(1, 1, 'buy ticket', 10.00, '2024-04-10'),
(3, 2, 'buy ticket', 10.00, '2024-04-11'),
(4, 3, 'buy ticket', 10.00, '2024-04-12'),
(5, 4, 'buy ticket', 80.00, '2024-04-13'),
(4, 5, 'buy ticket', 80.00, '2024-04-14'),
(3, 6, 'buy ticket', 10.00, '2024-04-15'),
(6, 7, 'buy ticket', 10.00, '2024-04-16'),
(7, 8, 'buy ticket', 10.00, '2024-04-17'),
(6, 9, 'buy ticket', 80.00, '2024-04-18'),
(7, 10, 'buy ticket', 80.00, '2024-04-19');

-- Insertion dans la table employee
INSERT INTO employee (name) VALUES
('John Doe'),
('Jane Smith'),
('Bob Brown');

-- Insertion dans la table poste
INSERT INTO poste (name, description) VALUES
('Confiserie', "Responsable de la vente et de la gestion des confiseries."),
('Projectionniste', "Responsable de la projection des films et de la gestion des équipements de projection."),
('Accueil', "Responsable de l'accueil des clients et de la gestion des billets.");

-- Insertion dans la table planning
INSERT INTO planning (employeeId, posteId, start_datetime, end_datetime) VALUES
(1, 1, '2024-04-23 09:00:00', '2024-04-23 17:00:00'),
(2, 2, '2024-04-23 10:00:00', '2024-04-23 18:00:00'),
(3, 3, '2024-04-23 11:00:00', '2024-04-23 19:00:00');

select salle.name, salle.description, salle.type, movie.title, movie.description , showtime.start_time, showtime.end_time, showtime.special_notes  
from salle 
inner join showtime 
ON salle.id = showtime.id 
INNER JOIN movie ON showtime.movieId = movie.id 
WHERE salle.maintenance_status = false 
AND showtime.date BETWEEN '2024-04-10' AND '2024-04-11' 
order by showtime.date ASC;

