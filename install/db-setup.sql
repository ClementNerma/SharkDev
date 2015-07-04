-- phpMyAdmin SQL Dump
-- version 4.4.3
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Sam 04 Juillet 2015 à 17:35
-- Version du serveur :  5.6.24
-- Version de PHP :  5.6.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données :  `skyer`
--

-- --------------------------------------------------------

--
-- Structure de la table `forums`
--

CREATE TABLE IF NOT EXISTS `forums` (
  `ID` int(11) NOT NULL,
  `read-only` int(11) NOT NULL,
  `min-rights` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
  `ID` int(11) NOT NULL,
  `sender` int(11) NOT NULL,
  `recipient` int(11) NOT NULL,
  `subject` varchar(256) NOT NULL,
  `content` longtext NOT NULL,
  `sent` datetime NOT NULL,
  `opened` tinyint(1) NOT NULL,
  `answerTo` int(11) NOT NULL,
  `sender_dir` varchar(10) NOT NULL,
  `recipient_dir` varchar(10) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `ID` int(11) NOT NULL,
  `author` int(11) NOT NULL,
  `title` varchar(256) NOT NULL,
  `content` longtext NOT NULL,
  `subject` int(11) NOT NULL,
  `likes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `subjects`
--

CREATE TABLE IF NOT EXISTS `subjects` (
  `ID` int(11) NOT NULL,
  `forum` int(11) NOT NULL,
  `author` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) NOT NULL,
  `locked` tinyint(1) NOT NULL,
  `tag` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `tokens`
--

CREATE TABLE IF NOT EXISTS `tokens` (
  `ID` int(11) NOT NULL,
  `owner` int(11) NOT NULL,
  `rights` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `ID` int(11) NOT NULL,
  `pseudo` varchar(20) NOT NULL,
  `firstname` varchar(20) NOT NULL,
  `lastname` varchar(20) NOT NULL,
  `fullname` varchar(40) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rights` int(11) NOT NULL,
  `register` datetime NOT NULL,
  `activated` tinyint(1) NOT NULL,
  `reputation` int(11) NOT NULL,
  `token` varchar(256) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

--
-- Contenu de la table `users`
--

INSERT INTO `users` (`ID`, `pseudo`, `firstname`, `lastname`, `fullname`, `password`, `email`, `rights`, `register`, `activated`, `reputation`, `token`) VALUES
(0, 'Robot', 'Skyer', 'Robot', 'Skyer Robot', '', '', 1, '2015-07-01 00:00:00', 1, 0, ''),
(1, 'admin', 'Admin', 'Unkown', 'Admin Unknwon', '9ca694a90285c034432c9550421b7b9dbd5c0f4b6673f05f6dbce58052ba20e4248041956ee8c9a2ec9f10290cdc0782', 'admin@host.local', 4, '2015-06-30 00:00:00', 1, 0, '6be6ed455d25353799355086799dc86fc0f7afffd9b120e2cd8639cb857b71ac');

--
-- Index pour les tables exportées
--

--
-- Index pour la table `forums`
--
ALTER TABLE `forums`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `title` (`title`),
  ADD UNIQUE KEY `subtitle` (`subtitle`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `title` (`title`);

--
-- Index pour la table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `pseudo` (`pseudo`),
  ADD UNIQUE KEY `fullname` (`fullname`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `forums`
--
ALTER TABLE `forums`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `posts`
--
ALTER TABLE `posts`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `tokens`
--
ALTER TABLE `tokens`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;