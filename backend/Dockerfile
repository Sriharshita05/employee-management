FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    unzip \
    zip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

RUN a2enmod rewrite

WORKDIR /var/www/html

COPY . .

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

RUN composer install --no-dev --optimize-autoloader

# Change Apache root to Laravel public folder
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80