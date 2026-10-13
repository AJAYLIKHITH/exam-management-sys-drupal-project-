# Competitive Exam Management System

A decoupled learning-management application for organising competitive-exam content. Drupal provides the content-management backend and JSON:API; a React/Vite application provides the student and administrator interface.

## Features

- Administrator and student login flows
- Exam, subject, material, and quiz content types
- Materials with video/PDF links and rich content
- Multiple-choice quizzes
- Admin create, edit, and delete actions through Drupal JSON:API
- Student registration and session-based authentication

## Built with

- [Drupal 11](https://www.drupal.org/) and PHP
- MySQL/MariaDB (via WAMP)
- Drupal JSON:API and the custom `exam_management` module
- React and Vite
- Composer, npm, and Drush

## Project layout

```text
drupal_test/
├── web/                              # Drupal web root
│   └── modules/custom/exam_management/ # Custom Drupal module and content model
├── frontend/                         # React/Vite client
├── composer.json                     # PHP/Drupal dependencies
└── frontend/package.json             # JavaScript dependencies
```

## Prerequisites

- WAMP Server with Apache, MySQL/MariaDB, PHP 8.3+ and the PHP extensions required by Drupal
- [Composer](https://getcomposer.org/)
- Node.js (current LTS) and npm

## Install and run on WAMP (Windows)

1. Clone the repository into WAMP's `www` folder:

   ```powershell
   cd C:\wamp64\www
   git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git drupal_test
   cd drupal_test
   ```

2. Install the PHP and JavaScript dependencies:

   ```powershell
   composer install
   cd frontend
   npm ci
   cd ..
   ```

3. Start WAMP and make sure the Apache and MySQL/MariaDB services are running.

4. Create an empty database in phpMyAdmin, for example `competitive_exam`.

5. Open Drupal's installer:

   ```text
   http://localhost/drupal_test/web/core/install.php
   ```

   Select MySQL/MariaDB and enter the database name and credentials you created. For a standard local WAMP setup, the database user is often `root` with an empty password, but use the values configured on your computer.

6. Enable the custom module and JSON:API, then rebuild the cache:

   ```powershell
   .\vendor\bin\drush en exam_management jsonapi -y
   .\vendor\bin\drush cr
   ```

   Enabling `exam_management` creates the Exam, Subject, Material, and Quiz content types. Create an administrator account during the Drupal installation; students can register from the React application.

7. In a second PowerShell window, start the React client:

   ```powershell
   cd C:\wamp64\www\drupal_test\frontend
   npm run dev
   ```

   Open the URL printed by Vite (normally `http://localhost:5173`). The frontend is already configured to use `http://localhost/drupal_test/web` as its Drupal API URL.

## Optional configuration

If Drupal is hosted at a different URL, create `frontend/.env.local` with the correct address, then restart Vite:

```text
VITE_DRUPAL_URL=http://localhost/your-project/web
```

The custom module allows the local Vite development origins `http://localhost:5173` and `http://localhost:5174`. If Vite runs on another port, add that origin to `web/modules/custom/exam_management/src/Controller/AccountController.php`, then run `..\vendor\bin\drush cr` from the project root.

## Production frontend build

```powershell
cd frontend
npm run build
```

This writes the compiled frontend to `frontend/dist/`. Serve that directory with a web server or deploy it separately after setting `VITE_DRUPAL_URL` for the target Drupal site.

## Important notes

- `vendor/`, `web/core/`, `frontend/node_modules/`, and Drupal's runtime `web/sites/default/files/` directory are intentionally excluded from Git because they are generated locally.
- This repository does not include a database export. A new installation creates the site structure but not existing users or content. To reproduce existing data, export your database separately and keep it out of the public repository if it contains private data.
- Do not commit `settings.php`, database dumps, or `.env` files containing credentials.

## Useful commands

```powershell
# Rebuild Drupal caches
.\vendor\bin\drush cr

# Check enabled modules
.\vendor\bin\drush pm:list --status=enabled

# Run the React development server
cd frontend
npm run dev
```
