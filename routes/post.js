const express = require('express');
// const { Sequelize, where } = require('sequelize');

const router = express.Router();

const { Posts } = require('../models');
const { Users } = require('../models');
// const { Likes } = require('../models');

const authMiddleware = require('../middlewares/auth-middleware.js');

// 전체 게시글 조회
router.get('/posts', async (req, res) => {
  const allPosts = await Posts.findAll({
    include: [
      {
        model: Users,
        attributes: ['nickname'],
      },
      //   {
      //     model: Likes,
      //     attributes: [[Sequelize.fn('COUNT', Sequelize.col('LPost_Id')), 'like']],
      //   },
    ],
    // group: ['LPost_Id'],
    // order: [['createdAt', 'DESC']],
  });

  if (!allPosts.length) {
    return res.status(404).json({
      errorMessage: '작성된 게시글이 없습니다.',
    });
  }
  return res.status(200).json({ allPosts });
});

// postId 값을 가진 게시글 조회
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  const post = await Posts.findOne({
    include: [
      {
        model: Users,
        attributes: ['nickname'],
      },
      // {
      //   model: Likes,
      //   attributes: [[Sequelize.fn('COUNT', Sequelize.col('LPost_Id')), 'likecount']],
      // },
    ],
    where: { postId: postId },
  });

  if (!post) {
    return res.status(404).json({
      errorMessage: '해당 게시글을 찾을 수 없습니다..',
    });
  }
  return res.status(200).json({ post });
});

// 게시글 생성
router.post('/posts', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;
  const post = await Posts.create({
    PUserId: userId,
    title,
    content,
  });

  return res.status(201).json({ post });
});

// // 게시글 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  const post = await Posts.findOne({ where: { postId: postId } });

  if (!post) {
    return res.status(404).json({
      success: false,
      errorMessage: '해당 게시글을 찾을 수 없습니다.',
    });
  } else if (post.PUserId !== userId) {
    return res.status(401).json({
      success: false,
      message: '권한이 없습니다.',
    });
  }
  await Posts.update(
    {
      title: title,
      content: content,
    },
    {
      where: { postId: postId },
    },
  );
  return res.status(200).json({
    success: true,
    message: '해당 게시글이 수정되었습니다.',
  });
});

// // 게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  const post = await Posts.findOne({ where: { postId: postId } });

  if (!post) {
    return res.status(404).json({
      success: false,
      errorMessage: '해당 게시글을 찾을 수 없습니다.',
    });
  } else if (post.PUserId !== userId) {
    return res.status(401).json({
      success: false,
      message: '권한이 없습니다.',
    });
  }
  await Posts.destroy({ where: { postId: postId } });
  return res.status(200).json({
    success: true,
    message: '해당 게시글이 삭제되었습니다.',
  });
});

module.exports = router;
