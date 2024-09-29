const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { auth, isOwner } = require('../middlewares/auth')

router.get("/posts", async (req, res, next) => {
    try {
        const data = await prisma.post.findMany({
            include: {
                user: true,
                comments: true
            },
            orderBy: {
                id: "desc",
            },
            take: 20
        });
        // setTimeout(() => {
            res.json(data);
        // }, 3000)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

router.get("/posts/:id", async (req, res, next) => {
    const {id} = req.params
    try {
        const data = await prisma.post.findFirst({
            where: {id: Number(id)},
            include: {
                user: true,
                comments: {
                    include: {
                        user: true
                    }
                }
            }
        })
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message})
    }
})

router.delete("/posts/:id", auth, isOwner("post"), async(req, res, next) => {
    try {
        const { id } = req.params
        await prisma.comment.deleteMany({
            where: { postId: Number(id)}
        });
        await prisma.post.delete({
            where: { id: Number(id) }
        })
        res.sendStatus(204)
    } catch (e) {
        res.status(500).json({message: e.message})
    }
})

router.delete("/comments/:id", auth, isOwner("comment"), async(req, res, next) => {
    try {
        const { id } = req.params
        await prisma.comment.delete({
            where: { postId: Number(id)}
        });
        res.sendStatus(204)
    } catch (e) {
        res.status(500).json({message: e.message})
    }
})

router.post("/posts", auth, async (req, res, next) => {
    const { content } = req.body;
    if(!content) {
        return res.status(400).json({msg: "content required"});
    }
    const user = res.locals.user;
    const post = await prisma.post.create({
        data: {
            content,
            userId: user.id
        }
    });

    const data = await prisma.post.findUnique({
        where: { id: Number(post.id) },
        include: {
            user: true,
            comments: {
                include: {
                    user: true
                }
            }
        }
    });
    res.json(data);
})

router.post("/comments", auth, async (req, res, next) => {
    const { content, postId } = req.body;
    const user = res.locals.user;
    if(!content || !postId) {
        return res.status(400).json({msg: "content and postId required"});
    }
    const comment = await prisma.comment.create({
        data: {
            content,
            userId: Number(user.id),
            postId: Number(postId)
        }
    })

    comment.user = user;
    res.json(comment)
})

module.exports = { contentRouter : router }