#!/bin/bash

echo "=== System Information ==="
echo "OS:" $(cat /etc/os-release | grep "PRETTY_NAME" | cut -d'"' -f2)

echo -e "\n=== Web Server Information ==="
# Проверяем Apache
if systemctl is-active --quiet httpd; then
    echo "Apache is running"
    echo "Apache version:" $(httpd -v | head -n1)
    echo "Apache config location:" $(apachectl -V | grep "SERVER_CONFIG_FILE" | awk '{print $2}')
    echo "Apache vhosts directory:" $(apachectl -V | grep "DEFAULT_VHOST" | awk '{print $2}')
fi

# Проверяем Nginx
if systemctl is-active --quiet nginx; then
    echo "Nginx is running"
    echo "Nginx version:" $(nginx -v 2>&1)
    echo "Nginx config location:" $(nginx -t 2>&1 | grep "configuration file" | awk '{print $4}')
fi

echo -e "\n=== Current Web Root Directories ==="
if [ -d "/var/www/html" ]; then
    echo "Contents of /var/www/html:"
    ls -l /var/www/html
fi

echo -e "\n=== Basic Auth Configuration ==="
if [ -f "/etc/httpd/conf.d/.htpasswd" ]; then
    echo "Basic auth file exists at /etc/httpd/conf.d/.htpasswd"
fi

echo -e "\n=== Node.js Information ==="
echo "Node version:" $(node -v)
echo "NPM version:" $(npm -v)

echo -e "\n=== Current Project Location ==="
pwd