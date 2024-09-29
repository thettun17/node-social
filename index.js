const express = require("express")
const prisma = require("./prismaClient")
const {contentRouter} = require("./routers/content")
const { userRouter } = require("./routers/user")

const app = express()
const cors = require("cors")

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors())


app.use('/content', contentRouter);
app.use("/", userRouter);


app.listen(9080, () => {
    console.log("server is running")
})

const gracefulShutdown = async () => {
    await prisma.$disconnect();
    app.close(() => {
        console.log("Yaycha API closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)