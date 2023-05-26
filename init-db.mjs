import Database from "better-sqlite3";
import { readFile, rm } from "node:fs/promises";

// delete the old file if it exists
try {
  await rm("proposal.db");
} catch (err) {
  if (err?.code !== "ENOENT") throw err;
}

const db = new Database("proposal.db", { readonly: false });

// execute the queries in proposals.sql to prepare a new database
db.exec(await readFile("proposal.sql", "utf-8"));

db.close();
