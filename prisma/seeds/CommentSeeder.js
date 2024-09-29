const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function CommentSeeder() {
    console.log("Comment Seeder Started...............");
    const data = [];
    for(let i = 0; i < 40; i++) {
        const content = faker.lorem.paragraph();
        const userId = faker.number.int({min: 1, max: 10});
        const postId = faker.number.int({min: 1, max: 20});
        data.push({
            content,
            userId,
            postId
        })
    }
    await prisma.comment.createMany({
        data
    });
    console.log("Comment Seeder Finished...............");
}


module.exports = { CommentSeeder }