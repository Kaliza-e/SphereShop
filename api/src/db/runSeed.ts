import { seedData } from "./seed";
import { initDb } from "./index";

async function main() {
  await initDb();
  await seedData();
  console.log("Database seeded successfully.");
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
