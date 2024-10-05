const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function LikeSeeder() {
  console.log("Post like seeder is running");
  for (let i = 0; i < 5; i++) {
    await prisma.postLike.create({
      data: {
        postId: 20,
        userId: faker.number.int({ min: 1, max: 10 }),
      },
    });
  }
  console.log("finished like seeding");
}

module.exports = { LikeSeeder };
