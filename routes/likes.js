const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

const { Posts } = require('../models');
const { Likes } = require('../models');

const authMiddleware = require('../middlewares/auth-middleware.js');

// 게시글 좋아요
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { postId } = req.params;
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
  } else if (thlike) {
    await Likes.destroy({ where: { LUser_Id: userId } });
    return res.status(400).json({
      errorMessage: '좋아요가 취소되었습니다.',
    });
  }
  await Likes.create({
    LPost_Id: postId,
    LUser_Id: userId,
  });
  return res.status(200).json({ message: '좋아요!' });
});

module.exports = router;
