import { listOpenSOS } from "./src/services/sosService.js";
import { getPrisma } from "./src/models/prisma.js";

async function run() {
  try {
    const list = await listOpenSOS(50, "f2281882-d5e0-4fac-9658-b922f8c96f03"); // Alex's userId from the token
    console.log("SUCCESS:", list);
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  } finally {
    const prisma = getPrisma();
    await prisma.$disconnect();
  }
}
run();
