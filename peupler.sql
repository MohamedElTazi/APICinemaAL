source bdd.sql

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
INSERT INTO showtime (salle_id, movie_id, date, start_time, end_time, special_notes) VALUES
(1, 1, '2024-04-10', '14:00:00', '16:00:00', ''),
(2, 2, '2024-04-10', '17:00:00', '19:02:00', 'Séance avec sous-titres pour sourds et malentendants'),
(3, 3, '2024-04-11', '20:00:00', '22:49:00', '');

INSERT INTO user (email, password, role, balance) VALUES
('user1@example.com', '$2b$10$FZ9JF63FDL8myPCw45Rc6OPW5kGoxBjvo4JoQ5kv3NSaeg4wd1y8S', 'user', 100),
('admin@example.com', '$2b$10$SYo74MK8oJf2KHvhY6wXM.wK3JnURr10AUrJ2gvUqGAEgPfunQ4sa', 'administrator', 500),
('user2@example.com', '$2b$10$kVHJqLq1oUEuDEidtBnzYekhCQFIlKlUj3VyEEJFFWWIjoWc4s77K', 'user', 50);

-- Insertion dans la table ticket
INSERT INTO ticket (showtime_id, user_id, status, is_super) VALUES
(1, 1, 'reserved', FALSE),
(2, 3, 'paid', TRUE),
(3, 1, 'cancelled', FALSE);

-- Insertion dans la table super_ticket_accesse
INSERT INTO super_ticket_accesse (ticket_id, showtime_id) VALUES
(2, 2);

-- Insertion dans la table transaction
INSERT INTO transaction (user_id, amount, transaction_type, transaction_date) VALUES
(1, 15.00, 'achat ticket', '2024-04-10 13:00:00'),
(2, 50.00, 'recharge balance', '2024-04-09 10:30:00'),
(3, 20.00, 'achat ticket', '2024-04-10 15:00:00');

-- Insertion dans la table employee
INSERT INTO employee (name, position, working_hours) VALUES
('John Doe', 'Caissier', 'Lundi-Vendredi: 8h-16h'),
('Jane Smith', 'Manager', 'Lundi-Vendredi: 9h-17h'),
('Bob Brown', 'Technicien', 'Lundi-Vendredi: 10h-18h');

select salle.name, salle.description, salle.type, movie.title, movie.description , showtime.start_time, showtime.end_time, showtime.special_notes  
from salle 
inner join showtime 
ON salle.salle_id = showtime.salle_id 
INNER JOIN movie ON showtime.movie_id = movie.movie_id 
WHERE salle.maintenance_status = false 
AND showtime.date BETWEEN '2024-04-10' AND '2024-04-11' 
AND showtime.start_time BETWEEN '14:00:00' AND '16:00:00' 
order by showtime.date ASC;

