FROM php:8.2-apache

# Installation de l'extension PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Activation de mod_rewrite pour les routes du framework
RUN a2enmod rewrite

# Configuration du document root Apache vers /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copie des fichiers du projet
COPY . /var/www/html

# Permissions pour les dossiers de stockage et uploads
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/public/uploads \
    && chmod -R 775 /var/www/html/storage /var/www/html/public/uploads

# Exposer le port par défaut
EXPOSE 80
