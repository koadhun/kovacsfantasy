import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Csatlakozás indul...");

client
  .connect()
  .then(() => {
    console.log("SIKERES kapcsolódás!");
    return client.query("select 1 as ok");
  })
  .then((res) => {
    console.log("Lekérdezés eredménye:", res.rows);
    return client.end();
  })
  .catch((err) => {
    console.error("HIBA:", err);
  });

setTimeout(() => {
  console.log("Még nem történt semmi 10 másodperc után...");
}, 10000);