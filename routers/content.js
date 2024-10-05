const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { auth, isOwner } = require("../middlewares/auth");

router.get("/posts", async (req, res, next) => {
  try {
    const data = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        likes: true,
      },
      orderBy: {
        id: "desc",
      },
      take: 20,
    });
    // setTimeout(() => {
    res.json(data);
    // }, 3000)
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/posts/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await prisma.post.findFirst({
      where: { id: Number(id) },
      include: {
        user: true,
        comments: {
          include: {
            user: true,
            commentLikes: true,
          },
        },
        likes: true,
      },
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/posts/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.comment.deleteMany({
      where: { postId: Number(id) },
    });
    await prisma.post.delete({
      where: { id: Number(id) },
    });
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete(
  "/comments/:id",
  auth,
  isOwner("comment"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await prisma.comment.delete({
        where: { postId: Number(id) },
      });
      res.sendStatus(204);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

router.post("/posts", auth, async (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ msg: "content required" });
  }
  const user = res.locals.user;
  const post = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });

  const data = await prisma.post.findUnique({
    where: { id: Number(post.id) },
    include: {
      user: true,
      comments: {
        include: {
          user: true,
        },
      },
    },
  });
  res.json(data);
});

router.post("/comments", auth, async (req, res, next) => {
  const { content, postId } = req.body;
  const user = res.locals.user;
  if (!content || !postId) {
    return res.status(400).json({ msg: "content and postId required" });
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: Number(user.id),
      postId: Number(postId),
    },
  });

  comment.user = user;
  res.json(comment);
});

router.post("/like/posts/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const user = res.locals.user;
  const like = await prisma.postLike.create({
    data: {
      postId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ like });
});

router.delete("/unlike/posts/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const user = res.locals.user;
  await prisma.postLike.deleteMany({
    where: {
      postId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ msg: `Unlike post ${id}` });
});

router.post("/like/comments/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const user = res.locals.user;

  const like = await prisma.commentLike.create({
    data: {
      commentId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ like });
});

router.delete("/unlike/comments/:id", auth, async (req, res, next) => {
  const { id } = req.params;
  const user = res.locals.user;
  await prisma.commentLike.deleteMany({
    where: {
      commentId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ msg: `Unlike Comment ${id}` });
});

router.get("/like/posts/:id", async (req, res, next) => {
  const { id } = req.params;

  const data = await prisma.postLike.findMany({
    where: {
      postId: Number(id),
    },
    include: {
      user: {
        include: {
          followers: true,
          following: true,
        },
      },
    },
  });
  res.json(data);
});

router.get("/like/comments/:id", async (req, res, next) => {
  const { id } = req.params;
  const data = await prisma.commentLike.findMany({
    where: {
      commentId: Number(id),
    },
    include: {
      user: {
        include: {
          followers: true,
          following: true,
        },
      },
    },
  });
  res.json(data);
});

module.exports = { contentRouter: router };