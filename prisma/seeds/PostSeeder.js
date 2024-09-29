const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function PostSeeder() {
    console.log("Post Seeder Started...............");
    const data = [];
    for(let i = 0; i < 20; i++) {
        const content = faker.lorem.paragraph();
        const userId = faker.number.int({min: 1, max: 10});
        data.push({
            content,
            userId
        })
    }
    await prisma.post.createMany({
        data
    });

    console.log("Finished Post Seeder.................")
}


module.exports = { PostSeeder }