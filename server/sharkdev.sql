-- phpMyAdmin SQL Dump
-- version 4.4.3
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Ven 03 Juillet 2015 à 18:40
-- Version du serveur :  5.6.24
-- Version de PHP :  5.6.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données :  `sharkdev`
--

-- --------------------------------------------------------

--
-- Structure de la table `API`
--

CREATE TABLE IF NOT EXISTS `API` (
  `ID` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `API_key` varchar(256) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Contenu de la table `API`
--

INSERT INTO `API` (`ID`, `name`, `API_key`) VALUES
(1, 'Initial API access key', '5aad5d82545fab9a53c436e9ad6ef65eb04f0b878ba8355922b1f802747af6e9');

-- --------------------------------------------------------

--
-- Structure de la table `security`
--

CREATE TABLE IF NOT EXISTS `security` (
  `IP` varchar(11) NOT NULL,
  `login_attempts` int(11) NOT NULL,
  `login_attempts_started` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `teams`
--

CREATE TABLE IF NOT EXISTS `teams` (
  `ID` int(11) NOT NULL,
  `name` int(11) NOT NULL,
  `admins` int(11) NOT NULL,
  `members` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `ID` int(11) NOT NULL,
  `name` varchar(36) NOT NULL,
  `password` varchar(256) NOT NULL,
  `email` varchar(128) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Contenu de la table `users`
--

INSERT INTO `users` (`ID`, `name`, `password`, `email`) VALUES
(1, 'root', 'a294b2a99f99f8f1f3972b5f859c37b0', 'root@localhost');

--
-- Index pour les tables exportées
--

--
-- Index pour la table `API`
--
ALTER TABLE `API`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `security`
--
ALTER TABLE `security`
  ADD PRIMARY KEY (`IP`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `API`
--
ALTER TABLE `API`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
