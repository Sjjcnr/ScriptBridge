import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const connectionString = 'postgresql://postgres:o1D4scn7nbomI0AF@db.daqafxdaiubehxfnshdw.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database');

    const sqlPath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration...');
    await client.query(sql);
    console.log('Migration executed successfully!');

  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();
