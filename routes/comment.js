const express = require('express');
const router = express.Router();
const Comments = require("../schemas/comment.js")
const Posts = require("../schemas/post.js");
const Users = require("../schemas/user.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 댓글 목록 조회
router.get("/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params

    const post = await Posts.findOne({ "_id": postId })
    const comment = await Comments.find({ postId: postId })

    if (!post) {
        return res.status(404).json({
            errorMessage: "게시글이 존재하지 않습니다."
        })
    }
    else {
        return res.status(200).json({
            success: true,
            "comments": comment
        })
    }
})

// 댓글 작성
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { userId } = res.locals.user
    const { comment } = req.body

    const post = await Posts.findOne({ "_id": postId })
    const user = await Users.findOne({ "_id": userId })

    if (!post) {
        return res.status(404).json({
            success: false,
            errorMessage: "게시글이 존재하지 않습니다."
        })
    }
    else if (!user) {
        return res.status(404).json({
            success: false,
            errorMessage: "로그인이 필요한 기능입니다."
        })
    }
    else if (!comment) {
        return res.status(400).json({
            success: false,
            errorMessage: "댓글 입력해주세요."
        })
    }
    else if (!req.body) {
        return res.status(400).json({
            success: false,
            errorMessage: "데이터 형식이 올바르지 않습니다."
        })
    }
    const creatdComment = await Comments.create({
        postId: postId,
        UserId: userId,
        nickname: user.nickname,
        comment: comment
    })
    return res.status(201).json({ comment: creatdComment })
})

// 댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const postId  = req.params.postId
    const commentId = req.params.commnetId
    const { userId } = res.locals.user
    const { comment } = req.body

    const post = await Posts.findOne({ "_id": postId })
    const Comment = await Comments.findOne({ "postId": postId })
    const CommentId = await Comments.findOne({ "_id": commentId })

    if (!post) {
        return res.status(404).json({
            success: false,
            errorMessage: "게시글이 존재하지 않습니다."
        })
    }
    else if (CommentId.UserId !== userId) {
        return res.status(404).json({
            success: false,
            errorMessage: "댓글의 수정 권한이 존재하지 않습니다."
        })
    }
    else if (!userId) {
        return res.status(404).json({
            success: false,
            errorMessage: "로그인이 필요한 기능입니다."
        })
    }
    else if (!Comment) {
        return res.status(404).json({
            success: false,
            errorMessage: "댓글이 존재하지 않습니다."
        })
    }
    else if (!comment) {
        return res.status(400).json({
            success: false,
            errorMessage: "댓글 내용을 입력해주세요."
        })
    }
    await Comments.updateOne(
        { "_id": Comment },
        {
            $set: {
                comment: comment,
                date: new Date,
            }
        }
    )
    return res.status(200).json({
        success: true,
        message: "해당 댓글이 수정되었습니다."
    })
})

// 댓글 삭제
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const postId  = req.params.postId
    const commentId = req.params.commentId
    const { userId } = res.locals.user

    const post = await Posts.findOne({ "_id": postId })
    const Comment = await Comments.findOne({ "postId": postId })
    const CommentId = await Comments.findOne({ "_id": commentId })

    if (!post) {
        return res.status(404).json({
            success: false,
            errorMessage: "게시글이 존재하지 않습니다."
        })
    }
    else if (CommentId.UserId !== userId) {
        return res.status(404).json({
            success: false,
            errorMessage: "댓글의 삭제 권한이 존재하지 않습니다."
        })
    }
    else if (!userId) {
        return res.status(404).json({
            success: false,
            errorMessage: "로그인이 필요한 기능입니다."
        })
    }
    else if (!Comment) {
        return res.status(404).json({
            success: false,
            errorMessage: "댓글이 존재하지 않습니다."
        })
    }
    await Comments.deleteOne(
        { "_id": Comment }
    )
    return res.status(200).json({
        success: true,
        message: "해당 댓글이 삭제되었습니다."
    })
})

module.exports = router