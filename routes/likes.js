const express = require('express');
const { Op } = require('sequelize');
const { Sequelize, where } = require('sequelize');

const router = express.Router();

const { Posts, Likes, Users } = require('../models');

const authMiddleware = require('../middlewares/auth-middleware.js');

// 게시글 좋아요
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
  const postId = req.params.postId;
  const { userId } = res.locals.user;

  const post = await Posts.findOne({ where: { postId: postId } });

  const thlike = await Likes.findOne({
    where: {
      [Op.and]: [{ LPost_Id: postId }, { LUser_Id: userId }],
    },
  });
  if (!post) {
    return res.status(404).json({
      success: false,
      errorMessage: '해당 게시글을 찾을 수 없습니다.',
    });
  } else if (!thlike) {
    await Posts.update({ like: post.like + 1 }, { where: { postId: post.postId } });

    await Likes.create({
      LPost_Id: postId,
      LUser_Id: userId,
    });
    return res.status(200).json({ message: '게시글에 좋아요를 눌렀습니다.' });
  } else if (thlike) {
    await Posts.update({ like: post.like - 1 }, { where: { postId: post.postId } });

    await Likes.destroy({
      where: {
        [Op.and]: [{ LPost_Id: postId }, { LUser_Id: userId }],
      },
    });

    return res.status(400).json({
      errorMessage: '좋아요가 취소되었습니다.',
    });
  }
});

// 좋아요 게시글 조회
router.get('/posts/like', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  const posts = await Likes.findAll({
    where: { LUser_Id: userId },
    include: [
      {
        model: Posts,
        order: [['like', 'DESC']],
        include: [
          {
            model: Users,
            attributes: ['nickname'],
          },
        ],
      },
    ],
    attributes: [],
  });

  return res.status(200).json({ posts });
});

module.exports = router;
