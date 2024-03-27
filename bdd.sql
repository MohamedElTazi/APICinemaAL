DROP DATABASE IF EXISTS `cinema`;
CREATE DATABASE `cinema`;

USE `cinema`;

CREATE TABLE `film` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) NOT NULL,
  `duree` int(11) NOT NULL,
  `dateSortie` date NOT NULL,
  `note` int(11) NOT NULL,
  `ageMinimal` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `seance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `heure_deb` time NOT NULL,
  `id_film` int(11) NOT NULL,
  `duree` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_film` (`id_film`),
  CONSTRAINT `seance_ibfk_1` FOREIGN KEY (`id_film`) REFERENCES `film` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `salle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_seance` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `images` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `capacite` int(11) NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
