drop database if exists restaurant_db;

create database if not exists restaurant_db character set utf8;
use restaurant_db;
# -----------------------------------------------------------------------------
#       table : paiement
# -----------------------------------------------------------------------------

create table if not exists paiement
 (
   id_paiement integer(2) not null  auto_increment,
   id_commandes integer(2) not null  ,
   id_mode_de_paiement integer(2) not null  ,
   montant real(5,0) null  ,
   date_de_paiement date null  
   , primary key (id_paiement) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : preference
# -----------------------------------------------------------------------------

create table if not exists preference
 (
   id_preference integer(2) not null  auto_increment,
   id_client integer(2) not null  ,
   intiluler varchar(128) null  
   , primary key (id_preference) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : plat
# -----------------------------------------------------------------------------

create table if not exists plat
 (
   id_plat integer(2) not null  auto_increment,
   id_categories integer(2) not null ,
   nom_plat varchar(128) null  ,
   description text null  ,
   prix real(5,0) null  
   , primary key (id_plat) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : etat
# -----------------------------------------------------------------------------

create table if not exists etat
 (
   id_etat integer(2) not null auto_increment ,
   en_cours varchar(128) null  ,
   livr�e varchar(128) null  ,
   annul�e varchar(128) null  
   , primary key (id_etat) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : client
# -----------------------------------------------------------------------------

create table if not exists client
 (
   id_client integer(2) not null  auto_increment,
   nom varchar(128) null  ,
   prenom varchar(128) null  ,
   numero_tel varchar(128) null  ,
   email varchar(128) null  
   , primary key (id_client) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : categories
# -----------------------------------------------------------------------------

create table if not exists categories
 (
   id_categories integer(2) not null auto_increment ,
   entree varchar(128) null  ,
   plat_principal varchar(128) null  ,
   dessert varchar(128) null  
   , primary key (id_categories) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : mode_paiement
# -----------------------------------------------------------------------------

create table if not exists mode_paiement
 (
   id_mode_de_paiement integer(2) not null auto_increment ,
   carte__de_credit varchar(128) null  ,
   espace varchar(128) null  
   , primary key (id_mode_de_paiement) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : commandes
# -----------------------------------------------------------------------------

create table if not exists commandes
 (
   id_commandes integer(2) not null  auto_increment,
   id_client integer(2) not null  ,
   date_commande date null  ,
   heure_commande time null  
   , primary key (id_commandes) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : lier
# -----------------------------------------------------------------------------

create table if not exists lier
 (
   id_commandes integer(2) not null  ,
   id_etat integer(2) not null  ,
   date_etat char(32) null  
   , primary key (id_commandes,id_etat) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       table : contenir
# -----------------------------------------------------------------------------

create table if not exists contenir
 (
   id_commandes integer(2) not null  ,
   id_plat integer(2) not null  ,
   qte char(32) null  
   , primary key (id_commandes,id_plat) 
 ) 
 comment = "";


# -----------------------------------------------------------------------------
#       creation des references de table
# -----------------------------------------------------------------------------


alter table paiement 
  add foreign key fk_paiement_commandes (id_commandes)
      references commandes (id_commandes) ;


alter table paiement 
  add foreign key fk_paiement_mode_paiement (id_mode_de_paiement)
      references mode_paiement (id_mode_de_paiement) ;


alter table preference 
  add foreign key fk_preference_client (id_client)
      references client (id_client) ;


alter table plat 
  add foreign key fk_plat_categories (id_categories)
      references categories (id_categories) ;


alter table commandes 
  add foreign key fk_commandes_client (id_client)
      references client (id_client) ;


alter table lier 
  add foreign key fk_lier_commandes (id_commandes)
      references commandes (id_commandes) ;


alter table lier 
  add foreign key fk_lier_etat (id_etat)
      references etat (id_etat) ;


alter table contenir 
  add foreign key fk_contenir_commandes (id_commandes)
      references commandes (id_commandes) ;


alter table contenir 
  add foreign key fk_contenir_plat (id_plat)
      references plat (id_plat) ;

