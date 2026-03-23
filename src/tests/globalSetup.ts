import { execSync } from 'child_process';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import { resetDb } from './resetDatabase';
dotenv.config({
  path: '.env.development'
});


const isContainerRunning = (): boolean => {
  try {
    const output = execSync('docker ps --filter "name=inventory-tests" --filter "status=running" -q');
    return output.toString().trim().length > 0;
  } catch {
    return false;
  }
};

const waitForPostgres = async ({ host = '', port = 0, user = '', password = '', database = '', timeoutMs = 15000, intervalMs = 500 }) => {
  const start = Date.now();
  // eslint-disable-next-line
  while (true) {
    try {
      const client = new pg.Client({ host, port, user, password, database });
      await client.connect();
      await client.end();
      return;
    } catch (error) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Postgres did not become ready in time: ${error}`);
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
};


export default async function globalSetup() {
  console.log('> Ensuring test DB container is running...');

  if (!isContainerRunning()) {
    execSync('docker-compose -p inventory-tests -f docker-compose.test.yml up -d', { stdio: 'inherit' });
  } else {
    console.log('> Container already running');
  }

  console.log('> Waiting for test DB to be ready...');
  const connection = {
    host: '127.0.0.1',
    port: 54329,
    user: 'postgres',
    password: 'postgres',
    database: 'inventory_testing'
  };
  await waitForPostgres(connection);
  const testClient = new pg.Client(connection);
  await testClient.connect();

  const knownTable = 'users';
  const { rows } = await testClient.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = $1
    ) AS has_table;
  `, [knownTable]);

  const schemaPath = './src/tests/db/schema.sql';
  if (!rows[0]?.has_table) {
    console.log('> Schema not found, dumping schema...');

    execSync(
      `pg_dump --schema-only --no-comments --schema=public --no-owner --no-privileges --dbname="${process.env.DB_CONNECTION_STRING}" > ${schemaPath}`,
      { stdio: 'inherit', env: process.env }
    );

    console.log('> Schema loaded');

    // Remove Supabase specific lines
    let schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    schemaSql = schemaSql
      .split('\n')
      .filter((line) => !line.startsWith('\\restrict') && !line.startsWith('\\unrestrict') && !line.startsWith('SET transaction_timeout'))
      .join('\n')
      .replace('CREATE SCHEMA public', 'CREATE SCHEMA IF NOT EXISTS public')
      .replace(/SET TIME ZONE '.*?';/g, `SET TIME ZONE 'UTC';`)
      .replace(/GMT[+-]\d{4} \(.*?\)/g, '');

    fs.writeFileSync(schemaPath, schemaSql);

    const schema = fs.readFileSync('src/tests/db/schema.sql', 'utf-8');
    await testClient.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await testClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
          CREATE ROLE service_role;
        END IF;
      END$$;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
      END$$;
    `);
    await testClient.query(schema);

  } else {
    console.log('> Schema already exists, skipping db initialization');
  }


  await testClient.end();
  await resetDb();
  console.log('> Test DB ready');
}
