import { open, save } from './deps.ts';

export const db = await open('jobboard.db');

window.addEventListener('unload', () => {
  db.close();
});

db.query(
  `CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME,
    updated_at DATETIME,
    active BOOLEAN,
    company_id INTEGER,
    apply_url TEXT,
    job_title CHARACTER(140),
    job_details TEXT,
    pay_range TEXT
  )`,
  []
);

db.query(
  `CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logo_url TEXT,
    name CHARACTER(50),
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    active BOOLEAN
  )`,
  []
);

await save(db);