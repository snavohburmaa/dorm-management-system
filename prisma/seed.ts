import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaPg({ connectionString: url });
}

const prisma = new PrismaClient({ adapter: getAdapter() });

async function main() {
  const now = new Date();

  // Demo user (matches existing seed: u1 / 123)
  const user = await prisma.user.upsert({
    where: { email: "u1" },
    create: {
      name: "u1",
      phone: "+95 9 000 000 000",
      building: "A",
      floor: "2",
      room: "204",
      email: "u1",
      password: "123",
      createdAt: now,
    },
    update: {},
  });

  // Demo technician (t1 / 123)
  const technician = await prisma.technician.upsert({
    where: { email: "t1" },
    create: {
      name: "t1",
      phone: "+95 9 111 111 111",
      email: "t1",
      password: "123",
      createdAt: now,
    },
    update: {},
  });

  // Demo maintenance request
  const request = await prisma.maintenanceRequest.create({
    data: {
      userId: user.id,
      title: "Water leak in bathroom",
      description: "There is a leak under the sink. Please check.",
      status: "pending",
      priority: "medium",
      technicianNotes: "",
      createdAt: now,
      updatedAt: now,
    },
  });

  // Demo notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      requestId: request.id,
      type: "request_created",
      title: "Issue reported",
      message:
        "Your maintenance request was created and is pending assignment.",
      createdAt: now,
    },
  });

  console.log("Seed complete: user u1, technician t1, 1 request, 1 notification.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
