# Meso 

Meso is a web application that provides a framework for remote synchronization of data and use 
of that data on web pages, including dynamic charting. It provides an HTTP-based API for accessing 
and updating data, and is especially suited for time series data.

This project was born out of a desire to create a dynamic and real-time web site for viewing 
data from a personal weather station. However, this usage limitation has been removed and it
can now be used for any data (although it's still heavily taylored to time series data). The
weather station application has been moved to a new project called [MesoWx] [1], but it is still 
based upon this project. See MesoWx for an example of how Meso can be used.

[1]: https://bitbucket.org/lirpa/mesowx

## Features ##

* Access to your data over HTTP
    * Adding/Updating your data
    * Retrieval of your data
        * With or without aggregation
        * Efficient unit conversion of data
* Integration in the browser
    * Javascript API
    * Dynamic charting
* Relational database support:
    * MySQL
    * More to come (e.g. PostgreSQL)

## Installation Guide

The Meso configuration revolves around the data that you want to work with, particuarly where 
your data resides and how it will populated and updated. These instructions will help guide the 
configuration for your needs.

### Install Prerequisites

You must first install the following:

1. A web server that supports PHP (e.g. Apache HTTP server, Nginx)
2. PHP 5.4+ w/MySQL PDO (PDO is typically installed by default)
3. MySQL 5+ (For remote database setup only)

How to install and manage these is outside the scope of these instructions.

### Database Setup

If you don't already have a database created to house your data, you'll need to setup the one up 
for use by Meso. If your data already exists, you may still want to create a separate user for Meso 
to access your database.

For MySQL:

1. Log in as an administrator

        $ mysql -u root -p

2. Create a database to house the data

        mysql> create database meso;

2. Create a user with access to this database (you might need to tweak the host if not local,
   substitute <PASSWORD> with a password for the user)

        mysql> CREATE USER 'meso'@'localhost' IDENTIFIED BY '<PASSWORD>';
        mysql> GRANT select, update, create, delete, insert ON meso.* TO meso@localhost;

### Install Meso

1. Expose the `web` folder via the web server.
2. Also make sure that the `/include/.htaccess` file is being applied by
   trying to access the example configuration file `/include/config-example.json` in a browser. 
   If not using Apache, use a similar means to prevent access to the files in the include folder. 
   **This is very important for protecting your configuration file**.

### Configure Meso

This is where you define your data sources and entities that you want to expose through Meso.
Create and edit a file named `config.json` in the `/include/` directory. You can do this by either 
copying the example file `/include/config-example.json`, starting from scratch, or if installing 
another project based on Meso it may include a configuration file that you can copy (e.g. MesoWx). 
See the comments in the example file for further documentation and instructions regarding the 
configuration.

## Troubleshooting ##

At the moment, error reporting from Meso is lacking. This will be improved in the future. Some tips are to 
inspect the network traffic using a development plugin such as Firebug or Chrome's developer tools. Using
these tools you can inspect the HTTP responses for errors messages. Another option is to inspect 
the apache/PHP system logs.
