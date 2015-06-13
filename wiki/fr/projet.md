
Un projet sont un ensemble de fichiers et sous-dossiers appartennant à un utilisateur ou à une équipe.

Chaque projet (même vierge) possède un sous-dossier nommé .config qui n'apparaît pas à l'utilisateur.

Il contient, entre autres, les fichiers suivants :

- config.xml
  - Contient la configuration du gestionnaire de versions, par exemple si toutes les modifications doivent être enregistrées ou si elles doivent toutes être fusionnées par tranche de 24 heures par exemple pour occupper moins d'espace disque.
  - La taille maximale du dossier 'versionning'
  - La taille maximale du dossier 'files'
  - La taille maximale totale du projet (en kilo-octets)
  - Le nombre de commits maximal
  - SharkDev doit-il écraser les plus anciens commits lorsqu'un nouveau commit tente d'être créé mais que le nombre de commits maximal / la taille maximale est atteint(e) ?
  - Le projet est-il lié à un projet de base (équivalent de *fork* sous GitHub) ?
  - Lorsqu'une mise à jour du projet de base (*fork*) est publiée, doit-on mettre à jour le projet ? (valeurs possibles : voir plus bas)

- informations.xml :
  - La date de création du projet et l'utilisateur (ou l'équipe) ayant créé le projet

Ainsi que le sous-dossier "versionning", contenant toutes les modifications apportées au projet, comme suit :

/versionning/<numero>

Note : Le numéro est incrémenté à chaque nouvelle modification

Ce dossier contient :

- Un fichier "informations.xml", contenant le nom de la version, sa date de création, son auteur, etc.
- Un sous-dossier "files", contenant les fichiers avant modification

Chaque version contient une copie conforme des fichiers modifiés, et uniquement de ceux-ci (cela inclut les fichiers supprimés et les fichiers créés depuis la dernière version !)

## Link

Lorsqu'un projet est lié à un projet de base, cela est spécifié dans le fichier config.xml (attribut link) sous la forme suivante :

utilisateur:projet

OU

equipe:projet

(le projet en question doit être public !)

NOTE : Si vous voyez @sharkdev@:projet, cela signifie que le projet est tiré d'un projet de base créé par moi-même ou par le robot SharkDev; la mention "@sharkdev@" est remplacée par les scripts PHP et JavaScript par le nom du robot SharkDev que vous aurez spécifié dans le fichier server/config.php

## Link Update

Pour les projets liés à un projet de base, il est possible de spécifier une valeur de mise à jour dans le fichier config.xml (l'attribut se nomme link-update).

Il peut prendre les valeurs suivantes :

- force-update : Mettre à jour le projet en écrasant les changements de l'utilisateur (fortement déconseillé)
- soft-update : Mets à jour uniquement les fichiers non modifiés du projet (fortement déconseillé pour des raisons de compatibilité)
- ask-user : Demander à l'utilisateur si il veut mettre à jour et lui faire sélectionner les fichiers à mettre à jour
