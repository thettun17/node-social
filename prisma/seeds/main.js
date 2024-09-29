const { UserSeeder } = require("./UserSeeder")
const { PostSeeder } = require("./PostSeeder")
const { CommentSeeder } = require("./CommentSeeder")

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        await UserSeeder();
        await PostSeeder();
        await CommentSeeder();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
main();