import { Postgreslite } from "./index.js";

const pg = new Postgreslite();

console.log("Creating table...");
await pg.query(`
  CREATE TABLE IF NOT EXISTS test (
    id SERIAL PRIMARY KEY,
    name TEXT
  );
`);

console.log("Inserting data...");
await pg.query(`
  INSERT INTO test (name) VALUES ('test');
`);

console.log("Selecting data...");
const res = await pg.query(`
  SELECT * FROM test;
`);

console.log(res);

try {
  await pg.query('1');
} catch (e) {
  console.log('Error caught:');
  console.log(e);
}

console.log(await pg.query('SELECT * FROM test;'));

// Test transaction

await pg.query('BEGIN;');
await pg.query('INSERT INTO test (name) VALUES (\'test2\');');
await pg.query('ROLLBACK;');
console.log(await pg.query('SELECT * FROM test;'));

await pg.query('BEGIN;');
await pg.query('INSERT INTO test (name) VALUES (\'test3\');');
await pg.query('COMMIT;');
console.log(await pg.query('SELECT * FROM test;'));

console.log("Postgreslite still running...");