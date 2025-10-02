# CONVERGE PRESENTS OpenCipher - Setup Instructions

This guide will help you set up the CTF platform on shared hosting, XAMPP, or any server with PHP and PostgreSQL/MySQL support.

## Requirements

- PHP 8.1 or higher
- PostgreSQL 12+ or MySQL 8.0+ (for MariaDB use 10.5+)
- Composer (PHP dependency manager)
- Web server (Apache/Nginx)
- Node.js 18+ and npm (for frontend build)

---

## Option 1: XAMPP Setup (Local Development)

### Step 1: Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP with Apache, PHP 8.1+, and MySQL/MariaDB
3. Start Apache and MySQL from XAMPP Control Panel

### Step 2: Setup Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create a new database named `ctf_platform`
3. Import the schema:
   - Click on the `ctf_platform` database
   - Go to "Import" tab
   - Select `api/schema.sql` file
   - Click "Go" to import

**Note for MySQL Users:** If using MySQL instead of PostgreSQL, replace `SERIAL` with `INT AUTO_INCREMENT` in schema.sql:
```sql
-- Change from:
id SERIAL PRIMARY KEY,
-- To:
id INT AUTO_INCREMENT PRIMARY KEY,
```

### Step 3: Install PHP Dependencies
1. Open terminal/command prompt in the `api` directory
2. Install Composer from https://getcomposer.org/ if not installed
3. Run:
```bash
cd api
composer install
```

### Step 4: Configure Database Connection
1. Create `.env` file in the root directory (copy from `.env.example` if exists)
2. Add database credentials:
```env
DATABASE_URL=mysql://root:@localhost/ctf_platform
# For PostgreSQL use:
# DATABASE_URL=postgresql://postgres:password@localhost/ctf_platform
```

3. Update `api/src/Database.php` if needed to match your database credentials

### Step 5: Setup Frontend (Build for Production)
1. Open terminal in the root directory
2. Install Node.js dependencies:
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

This creates optimized files in the `dist` folder.

### Step 6: Configure Apache
1. Copy the entire project to XAMPP's `htdocs` folder:
   ```
   C:\xampp\htdocs\ctf-platform\
   ```

2. Create an `.htaccess` file in the root directory:
```apache
RewriteEngine On

# API routes
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ api/public/index.php [L,QSA]

# Frontend routes (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

3. Create another `.htaccess` in the `api/public` directory:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

4. Enable mod_rewrite in XAMPP:
   - Open `C:\xampp\apache\conf\httpd.conf`
   - Uncomment: `LoadModule rewrite_module modules/mod_rewrite.so`
   - Restart Apache

### Step 7: Access the Platform
1. Open your browser
2. Go to: http://localhost/ctf-platform
3. Login with default admin credentials:
   - Email: `admin@ctf.local`
   - Password: `admin123`

---

## Option 2: Shared Hosting Setup

### Prerequisites
- cPanel or similar control panel
- PHP 8.1+ with mysqli/pgsql extension
- MySQL/PostgreSQL database access
- SSH access (optional but recommended)

### Step 1: Upload Files
1. Build the frontend locally:
```bash
npm install
npm run build
```

2. Upload these folders/files to your hosting via FTP/cPanel File Manager:
   - `/api` folder (entire directory)
   - `/dist` folder (built frontend)
   - `.htaccess` file (create if not exists)

### Step 2: Create Database
1. Log into cPanel
2. Go to "MySQL Databases" or "PostgreSQL Databases"
3. Create a database (e.g., `username_ctf`)
4. Create a database user with a strong password
5. Add user to database with ALL PRIVILEGES
6. Note down:
   - Database name
   - Database user
   - Database password
   - Database host (usually `localhost`)

### Step 3: Import Schema
1. Go to phpMyAdmin in cPanel
2. Select your database
3. Click "Import"
4. Upload `api/schema.sql`
5. Click "Go"

For MySQL, edit schema.sql first to replace `SERIAL` with `INT AUTO_INCREMENT`.

### Step 4: Install Composer Dependencies
**Option A: If you have SSH access:**
```bash
cd public_html/api
composer install --no-dev --optimize-autoloader
```

**Option B: Without SSH access:**
1. Install dependencies locally:
```bash
cd api
composer install --no-dev
```
2. Upload the entire `vendor` folder to your hosting

### Step 5: Configure Environment
1. Create `.env` file in the root of your hosting:
```env
DATABASE_URL=mysql://db_user:db_password@localhost/db_name
```

2. Update `api/src/Database.php` with your database credentials

### Step 6: Configure .htaccess
Create `.htaccess` in public_html root:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # API routes
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api/(.*)$ api/public/index.php [L,QSA]

    # Serve static files from dist
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api
    RewriteRule ^(.*)$ dist/$1 [L]

    # SPA fallback
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ dist/index.html [L]
</IfModule>
```

### Step 7: Set Permissions
```bash
chmod -R 755 api
chmod -R 755 dist
```

### Step 8: Test
Visit your domain:
- Frontend: `https://yourdomain.com`
- API Health Check: `https://yourdomain.com/api/health`

---

## Option 3: Production Server (Ubuntu/Debian)

### Step 1: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.1+ and extensions
sudo apt install php8.1 php8.1-fpm php8.1-pgsql php8.1-mbstring php8.1-xml php8.1-curl -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Setup Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ctf_platform;
CREATE USER ctf_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ctf_platform TO ctf_user;
\q
```

Import schema:
```bash
psql -U ctf_user -d ctf_platform -f api/schema.sql
```

### Step 3: Install Application
```bash
# Clone or upload your project
cd /var/www
sudo mkdir ctf-platform
cd ctf-platform

# Install PHP dependencies
cd api
composer install --no-dev --optimize-autoloader
cd ..

# Install and build frontend
npm install
npm run build
```

### Step 4: Configure Environment
Create `.env` file:
```env
DATABASE_URL=postgresql://ctf_user:your_secure_password@localhost/ctf_platform
```

### Step 5: Configure Nginx
Create `/etc/nginx/sites-available/ctf-platform`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/ctf-platform/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        alias /var/www/ctf-platform/api/public;
        try_files $uri /api/public/index.php$is_args$args;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $request_filename;
        }
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ctf-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/ctf-platform
sudo chmod -R 755 /var/www/ctf-platform
```

---

## Default Admin Credentials

After setup, log in with:
- **Email:** `admin@ctf.local`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## Troubleshooting

### Issue: "Failed to fetch" or API errors
**Solution:** Check that:
1. PHP is running correctly
2. Database connection is configured properly in `.env` or `Database.php`
3. `.htaccess` mod_rewrite is enabled
4. API endpoint returns JSON: `curl http://localhost/api/health`

### Issue: Database connection failed
**Solution:**
1. Verify database credentials in `.env` or `api/src/Database.php`
2. Check if database service is running
3. Test connection: `psql -U username -d database_name` (PostgreSQL) or `mysql -u username -p database_name` (MySQL)

### Issue: Blank page after setup
**Solution:**
1. Check browser console for errors (F12)
2. Ensure `dist/index.html` exists
3. Check Apache/Nginx error logs
4. Verify file permissions (755 for directories, 644 for files)

### Issue: 404 on API routes
**Solution:**
1. Ensure mod_rewrite is enabled (Apache) or try_files is configured (Nginx)
2. Check `.htaccess` files are present and correctly configured
3. Verify API routes in `api/public/index.php`

---

## Security Recommendations

1. **Change default admin password**
2. **Use HTTPS** (Let's Encrypt for free SSL)
3. **Set strong database passwords**
4. **Restrict database access** to localhost only
5. **Keep PHP and dependencies updated**
6. **Disable error display** in production (edit php.ini)
7. **Set up regular backups** of database and files

---

## Additional Configuration

### For Development (Vite + PHP):
```bash
# Terminal 1: Start PHP backend
cd api/public
php -S localhost:3000

# Terminal 2: Start Vite dev server with proxy
npm run dev
```

Access at: http://localhost:5000

---

## Support

For issues or questions, please refer to the project documentation or create an issue on the repository.
