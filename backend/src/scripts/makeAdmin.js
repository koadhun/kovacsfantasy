import { prisma } from "../lib/prisma.js";

const identifier = process.argv[2];

if (!identifier) {
  console.error("Usage: node src/scripts/makeAdmin.js <username-or-email>");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    console.error(`User not found: ${identifier}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  console.log("User updated:");
  console.log(updated);
}

main()
  .catch((err) => {
    console.error("makeAdmin failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });