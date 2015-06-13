
# Shark Dev

SharkDev est une application server écrite en PHP et permettant le développement de projet en équipe ou seul.

NOTE : Shark Dev Studio est un client Shark Dev (cf. shark-dev-studio.md)

Il existe deux couches utilisateurs : les équipes et les utilisateurs.

Un utilisateur peut être rattaché ou non à une équipe.

Chaque équipe et utilisateur possède des fichiers publics, accessibles à tous, et des fichiers privés, accessibles uniquement à ses membres (sauf pour l'utilisateur).

Tous les fichiers sont regroupés dans un projet.

Les fichiers sont stockés sur un serveur, sous la forme suivante (ici, pour les utilisateurs) :

/<utilisateur>/<public|private>/<projet>/<fichier>

Un utilisateur peut faire partie de plusieurs équipes.
Seul les administrateurs d'une équipe peuvent en accepter de nouveaux membres.
