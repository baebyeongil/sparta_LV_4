const express = require('express');
const router = express.Router();

const { Posts } = require('../models');
const { Users } = require('../models');
const { Comments } = require('../models');

const authMiddleware = require('../middlewares/auth-middleware.js');

// 댓글 목록 조회
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  const post = await Posts.findOne({ where: { CPostId: postId } });
  const comment = await Comments.findAll({ where: { CPostId: postId } });

  if (!post) {
    return res.status(404).json({
      errorMessage: '게시글이 존재하지 않습니다.',
    });
  }
  return res.status(200).json({ comment });
});

// 댓글 생성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  const { postId } = req.params;
  const post = await Posts.findOne({ where: { CPostId: postId } });

  const { comment } = req.body;

  if (!post) {
    return res.status(404).json({
      success: false,
      errorMessage: '게시글이 존재하지 않습니다.',
    });
  } else if (!comment) {
    return res.status(400).json({
      success: false,
      errorMessage: '댓글 입력해주세요.',
    });
  } else if (!req.body) {
    return res.status(400).json({
      success: false,
      errorMessage: '데이터 형식이 올바르지 않습니다.',
    });
  }
  const wrtcomment = await Comments.create({
    include: [
      {
        model: Users,
        attributes: ['nickname'],
      },
    ],
    CPostId: postId,
    CUserId: userId,
    comment,
  });

  return res.status(201).json({ wrtcomment });
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { commentId } = req.params;
  const { userId } = res.locals.user;
  const { comment } = req.body;

  const post = await Posts.findOne({ where: { CPostId: postId } });
  const thComment = await Comments.findOne({ where: { CPostId: postId } });
  const CommentId = await Comments.findOne({ where: { commentId: commentId } });

  if (!post) {
    return res.status(404).json({
      success: false,
      errorMessage: '게시글이 존재하지 않습니다.',
    });
  } else if (CommentId.CUserId !== userId) {
    return res.status(404).json({
      success: false,
      errorMessage: '댓글의 수정 권한이 존재하지 않습니다.',
    });
  } else if (!thComment) {
    return res.status(404).json({
      success: false,
      errorMessage: '댓글이 존재하지 않습니다.',
    });
  } else if (!comment) {
    return res.status(400).json({
      success: false,
      errorMessage: '댓글 내용을 입력해주세요.',
    });
  }
  await Comments.update(
    {
      comment: comment,
    },
    {
      where: { commentId: commentId },
    },
  );
  return res.status(200).json({
    success: true,
    message: '해당 댓글이 수정되었습니다.',
  });
});

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { commentId } = req.params;
  const { userId } = res.locals.user;

  const post = await Posts.findOne({ where: { CPostId: postId } });
  const thcomment = await Comments.findAll({ where: { CPostId: postId } });
  const CommentId = await Comments.findOne({ where: { commentId: commentId } });

  if (!post) {
    return res.status(404).json({
      success: false,
      errorMessage: '게시글이 존재하지 않습니다.',
    });
  } else if (CommentId.CUserId !== userId) {
    return res.status(404).json({
      success: false,
      errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.',
    });
  } else if (!thcomment) {
    return res.status(404).json({
      success: false,
      errorMessage: '해당 게시글에 댓글이 존재하지 않습니다.',
    });
  }
  await Comments.destroy({ where: { commentId: commentId } });
  return res.status(200).json({
    success: true,
    message: '해당 댓글이 삭제되었습니다.',
  });
});

module.exports = router;
