-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Client :  127.0.0.1
-- Généré le :  Mer 18 Mars 2026 à 03:59
-- Version du serveur :  5.6.17
-- Version de PHP :  5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données :  `dbtest`
--

-- --------------------------------------------------------

--
-- Structure de la table `bus`
--

CREATE TABLE IF NOT EXISTS `bus` (
  `id_bus` int(11) NOT NULL,
  `immatriculation` varchar(50) DEFAULT NULL,
  `capacite` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `id_ligne` varchar(50) DEFAULT NULL,
  `id_chauffeur` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_bus`),
  KEY `id_ligne` (`id_ligne`),
  KEY `id_chauffeur` (`id_chauffeur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Contenu de la table `bus`
--

INSERT INTO `bus` (`id_bus`, `immatriculation`, `capacite`, `status`, `id_ligne`, `id_chauffeur`) VALUES
(1, 'B01', 40, 'ptest', '1', 'C01'),
(2, 'B02', 35, 'actif', '1', 'C02'),
(3, 'B03', 50, 'maintenance', '2', 'C03');

-- --------------------------------------------------------

--
-- Structure de la table `chauffeur`
--

CREATE TABLE IF NOT EXISTS `chauffeur` (
  `id_chauffeur` varchar(50) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `telephone` bigint(20) DEFAULT NULL,
  `num_permis` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id_chauffeur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Contenu de la table `chauffeur`
--

INSERT INTO `chauffeur` (`id_chauffeur`, `nom`, `prenom`, `telephone`, `num_permis`) VALUES
('C01', 'Ali', 'Mohamed', NULL, NULL),
('C02', 'Ahmed', 'Salem', NULL, NULL),
('C03', 'Sidi', 'Oumar', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

CREATE TABLE IF NOT EXISTS `client` (
  `id_client` int(11) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `telephone` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `dept`
--

CREATE TABLE IF NOT EXISTS `dept` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nomDept` varchar(66) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=4 ;

--
-- Contenu de la table `dept`
--

INSERT INTO `dept` (`id`, `nomDept`) VALUES
(1, 'ISMS'),
(2, 'ISME'),
(3, 'ESP');

-- --------------------------------------------------------

--
-- Structure de la table `ligne`
--

CREATE TABLE IF NOT EXISTS `ligne` (
  `id_ligne` varchar(50) NOT NULL,
  `nom_ligne` varchar(50) DEFAULT NULL,
  `depart` varchar(50) DEFAULT NULL,
  `arrive` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_ligne`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Contenu de la table `ligne`
--

INSERT INTO `ligne` (`id_ligne`, `nom_ligne`, `depart`, `arrive`) VALUES
('1', 'Ligne 1', 'Centre', 'Université'),
('2', 'Ligne 2', 'Marché', 'Aéroport');

-- --------------------------------------------------------

--
-- Structure de la table `panne`
--

CREATE TABLE IF NOT EXISTS `panne` (
  `id_panne` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `date_signalement` datetime DEFAULT NULL,
  `id_bus` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_panne`),
  KEY `id_bus` (`id_bus`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `reservation`
--

CREATE TABLE IF NOT EXISTS `reservation` (
  `id_reservation` varchar(50) NOT NULL,
  `date_res` datetime DEFAULT NULL,
  `nb_place` int(11) DEFAULT NULL,
  `statut_paiement` varchar(50) DEFAULT NULL,
  `id_bus` int(11) DEFAULT NULL,
  `id_client` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_reservation`),
  KEY `id_bus` (`id_bus`),
  KEY `id_client` (`id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(66) NOT NULL,
  `email` varchar(77) NOT NULL,
  `id_dept` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_dept` (`id_dept`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=25 ;

--
-- Contenu de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `id_dept`, `image`) VALUES
(8, 'Ahmed Aly', 'ahmed@isme.mr', 2, '20260105_210213_beyt.jpg'),
(17, 'Alioune Mohamed', 'alioune@gmail.com', 1, '20260108_103218_scaled_isms.png'),
(20, 'Ahmed SEJAD', 'ahmed.sejad@esp.mr', 1, '20260108_123459_scaled_398549.jpg'),
(23, 'testing', 'testing@gmail.com', 2, NULL),
(24, 'mariem Ahmed', 'mariem@esp.mr', 2, NULL);

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `bus`
--
ALTER TABLE `bus`
  ADD CONSTRAINT `bus_ibfk_1` FOREIGN KEY (`id_ligne`) REFERENCES `ligne` (`id_ligne`),
  ADD CONSTRAINT `bus_ibfk_2` FOREIGN KEY (`id_chauffeur`) REFERENCES `chauffeur` (`id_chauffeur`);

--
-- Contraintes pour la table `panne`
--
ALTER TABLE `panne`
  ADD CONSTRAINT `panne_ibfk_1` FOREIGN KEY (`id_bus`) REFERENCES `bus` (`id_bus`);

--
-- Contraintes pour la table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_bus`) REFERENCES `bus` (`id_bus`),
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`);

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_dept`) REFERENCES `dept` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
