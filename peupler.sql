source bdd.sql

INSERT INTO salle (name, description, type, capacity, access_disabled, maintenance_status) VALUES
('Salle Rouge', "Une salle avec des sièges rouges confortables, idéale pour les films d\'amour.", "standard", 25, FALSE, FALSE),
('Salle Verte', 'Salle équipée pour les personnes à mobilité réduite.', 'accessible', 20, TRUE, FALSE),
('Salle Bleue', 'Une petite salle cosy pour des projections privées.', 'privée', 15, FALSE, TRUE);

-- Insertion dans la table movie
INSERT INTO movie (title, description, duration, genre) VALUES
("Les Aventures de Tintin", "Tintin et Milou partent à la recherche du trésor perdu.", "02:00:00", "Aventure"),
("Amélie Poulain", "La vie quoditienne d\'Amélie, une jeune femme parisienne.", "02:02:00", "Comédie"),
("Interstellar", "Un voyage à travers l\'espace pour sauver l\'humanité.", "02:53:28", "Science-Fiction");

-- Insertion dans la table showtime
INSERT INTO showtime (salleId, movieId, start_datetime, end_datetime, special_notes) VALUES
(1, 1, '2024-03-10 14:00:00', '2024-03-10 16:00:00', ''),
(2, 2, '2024-05-10 17:00:00', '2024-05-10 19:00:00', 'Séance avec sous-titres pour sourds et malentendants'),
(3, 3, '2024-05-11 20:00:00', '2024-05-11-20:00:00', '');

INSERT INTO user (firstname, lastname,email, password, role, balance) VALUES
('Antoine', 'Dufour','user1@example.com', '$2b$10$LKHQLFbLHw7md6jS9UIbxOGRVUV.c/4skjqzhPuEOdgHxqhvgaC2W', 'user', 100), /* password: password1 */
('Mehdi','Bellil','admin@example.com', '$2b$10$ZoAnhqUHS7sShkq/7fLS9.2iTlQ.z./yIAThCiNPj7vLWlrVsLDv6', 'administrator', 0), /* password: password2 */
('Ines','Zemouche','user2@example.com', '$2b$10$lf2XD4g1HRdAK2Zy6DZj.uZOsIz4eiAIcG0fo5716A6JayQO6FOLa', 'user', 50); /* password: password3 */

INSERT INTO ticket (userId, is_used, is_super,price ,nb_tickets) VALUES
(1, FALSE, FALSE, 10,1),
(2, FALSE, FALSE, 10,1),
(3, FALSE, FALSE, 10, 1),
(1, FALSE, TRUE, 80, 9),
(2, FALSE, TRUE, 80 ,8);


INSERT INTO ticket_showtime_accesses (ticketId, showtimeId) VALUES
(4, 1),
(5, 2),
(5, 3);

-- Insertion dans la table transaction
INSERT INTO transaction (userId, amount, transaction_type, transaction_date) VALUES
(1, 15.00, 'buy ticket', '2024-04-10 13:00:00'),
(2, 50.00, 'recharge balance', '2024-04-09 10:30:00'),
(3, 20.00, 'withdraw balance', '2024-04-10 15:00:00');

-- Insertion dans la table employee
/*INSERT INTO employee (name, position, working_hours) VALUES
('John Doe', 'Caissier', 'Lundi-Vendredi: 8h-16h'),
('Jane Smith', 'Manager', 'Lundi-Vendredi: 9h-17h'),
('Bob Brown', 'Technicien', 'Lundi-Vendredi: 10h-18h');*/

/*select salle.name, salle.description, salle.type, movie.title, movie.description , showtime.start_datetime, showtime.end_datetime, showtime.special_notes  
from salle 
inner join showtime 
ON salle.id = showtime.salleId 
INNER JOIN movie ON showtime.movieId = movie.id 
WHERE salle.maintenance_status = false 
AND showtime.start_datetime >= '2024-04-10'  
AND showtime.end_datetime <= '2024-04-11 23:59:59'; 

order by showtime.start_datetime ASC;

SELECT COUNT(*) 
FROM showtime 
WHERE start_datetime <= 'nouvelle_fin_plage_horaire' 
AND DATE_ADD(end_datetime, INTERVAL 30 MINUTE) >= 'nouvelle_debut_plage_horaire';
AND salleId = 'id_salle';


SELECT
    u.id AS user_id,
    u.firstname,
    u.lastname,
    u.email,
    u.role,
    u.balance,
    COUNT(DISTINCT t.id) AS total_tickets,
    SUM(CASE WHEN t.is_used = TRUE THEN 1 ELSE 0 END) AS tickets_used,
    SUM(t.nb_tickets) AS total_tickets_purchased,
    COUNT(DISTINCT ts.id) AS total_ticket_showtime_accesses,
    COUNT(DISTINCT tr.id) AS total_transactions,
    GROUP_CONCAT(DISTINCT m.title ORDER BY m.title ASC SEPARATOR ', ') AS movies_watched,
    GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.start_datetime, '-', s.end_datetime) ORDER BY s.id ASC SEPARATOR ', ') AS showtimes_info
FROM
    user u
LEFT JOIN
    ticket t ON u.id = t.userId
LEFT JOIN
    ticket_showtime_accesses ts ON t.id = ts.ticketId
LEFT JOIN
    transaction tr ON u.id = tr.userId
LEFT JOIN
    showtime s ON ts.showtimeId = s.id
LEFT JOIN
    movie m ON s.movieId = m.id
GROUP BY
    u.id;


*/

