source C:\Users\tmoha\Desktop\APICinemaAL/bdd.sql

INSERT INTO salle (name, description, type, capacity, access_disabled, maintenance_status) VALUES
('Salle Rouge', "Une salle avec des sièges rouges confortables, idéale pour les films d\'amour.", "standard", 25, FALSE, FALSE),
('Salle Verte', 'Salle équipée pour les personnes à mobilité réduite.', 'accessible', 20, TRUE, FALSE),
('Salle Bleue', 'Une petite salle cosy pour des projections privées.', 'privée', 15, FALSE, TRUE);

-- Insertion dans la table movie
INSERT INTO movie (title, description, duration, genre) VALUES
("Les Aventures de Tintin", "Tintin et Milou partent à la recherche du trésor perdu.", 120, "Aventure"),
("Amélie Poulain", "La vie quoditienne d\'Amélie, une jeune femme parisienne.", 122, "Comédie"),
("Interstellar", "Un voyage à travers l\'espace pour sauver l\'humanité.", 169, "Science-Fiction");

-- Insertion dans la table showtime
INSERT INTO showtime (salleId, movieId, date, start_time, end_time, special_notes) VALUES
(1, 1, '2024-04-10', '14:00:00', '16:00:00', ''),
(2, 2, '2024-04-10', '17:00:00', '19:02:00', 'Séance avec sous-titres pour sourds et malentendants'),
(3, 3, '2024-04-11', '20:00:00', '22:49:00', '');

INSERT INTO user (email, password, role, balance) VALUES
('user1@example.com', '$2b$10$LKHQLFbLHw7md6jS9UIbxOGRVUV.c/4skjqzhPuEOdgHxqhvgaC2W', 'user', 100), /* password: password1 */
('admin@example.com', '$2b$10$ZoAnhqUHS7sShkq/7fLS9.2iTlQ.z./yIAThCiNPj7vLWlrVsLDv6', 'administrator', 0), /* password: password2 */
('user2@example.com', '$2b$10$lf2XD4g1HRdAK2Zy6DZj.uZOsIz4eiAIcG0fo5716A6JayQO6FOLa', 'user', 50); /* password: password3 */

-- Insertion dans la table ticket
INSERT INTO ticket (showtimeId, userId, status, is_super) VALUES
(1, 1, 'reserved', FALSE),
(2, 3, 'paid', TRUE),
(3, 1, 'cancelled', FALSE);

-- Insertion dans la table super_ticket_accesse
INSERT INTO super_ticket_accesse (ticketId, showtimeId) VALUES
(2, 2);

-- Insertion dans la table transaction
INSERT INTO transaction (userId, amount, transaction_type, transaction_date) VALUES
(1, 15.00, 'achat ticket', '2024-04-10 13:00:00'),
(2, 50.00, 'recharge balance', '2024-04-09 10:30:00'),
(3, 20.00, 'achat ticket', '2024-04-10 15:00:00');

-- Insertion dans la table employee
INSERT INTO employee (name, address, phone_number, status) VALUES
('John Doe', '123 Rue de la Confiserie, paris', '0123456789', 'Temps plein'),
('Jane Smith', '456 Avenue de la Division Leclerc, paris', '9876543210', 'Temps partiel'),
('Bob Brown', '789 Boulevard du Cinéma, paris', '555444333', 'Contrat temporaire');

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

