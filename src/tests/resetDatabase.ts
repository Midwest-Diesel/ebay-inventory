import pg from 'pg';
import fs from 'fs';


export async function resetDb() {
  const client = new pg.Client({
    host: '127.0.0.1',
    port: 54329,
    user: 'postgres',
    password: 'postgres',
    database: 'inventory_testing'
  });
  await client.connect();
  
  await client.query(`
    DO $$
    DECLARE
      stmt text;
    BEGIN
      EXECUTE 'SET session_replication_role = replica';

      FOR stmt IN
        SELECT 'TRUNCATE TABLE "' || tablename || '" RESTART IDENTITY CASCADE;'
        FROM pg_tables
        WHERE schemaname = 'public'
      LOOP
        EXECUTE stmt;
      END LOOP;

      EXECUTE 'SET session_replication_role = DEFAULT';
    END $$;
  `);

  const initPath = 'src/tests/db/init.sql';
  const initSql = fs.readFileSync(initPath, 'utf-8');
  
  await client.query('BEGIN');
  await client.query('SET session_replication_role = replica;');
  await client.query(initSql);
  await client.query('SET session_replication_role = DEFAULT;');
  await client.query('COMMIT');
  await client.end();
}
