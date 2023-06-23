const express = require("express")
const router = express.Router()

const { Users } = require("../models")
const { Posts } = require("../models")

const authMiddleware = require("../middlewares/auth-middleware.js")

// 전체 게시글 조회
router.get("/posts", async (req, res) => {
    const allPosts = await Posts.findAll({
        attributes: ["postId", "userId", "title", "createdAt", "updatedAt"],
        order: [['createdAt', 'DESC']],
      });

    if (!allPosts.length) {
        return res.status(404).json({
            errorMessage: "작성된 게시글이 없습니다."
        })
    }
    else {
        return res.status(200).json({
            success: true,
            "posts": allPosts
        })
    }
})

// postId 값을 가진 게시글 조회
router.get("/posts/:postId",  async (req, res) => {
    const { postId } = req.params

    const post = await Posts.findOne({ where: { "postId": postId } })

    if (!post) {
        return res.status(404).json({
            errorMessage: "해당 게시글을 찾을 수 없습니다.."
        })
    }
    else {
        const result = {
            title : post.title,
            nickname : post.nickname,
            date : post.date,
            content : post.content
        }

        return res.status(200).json({result})
    }
})

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user
    const { nickname } = res.locals.user
    const { title, content } = req.body
  
    const post = await Posts.create({
      UserId: userId,
      Nickname: nickname,
      title,
      content,
    });
  
    return res.status(201).json({ data: post });
  });

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { userId } = res.locals.user
    const { title, content, } = req.body

    const post = await Posts.findOne({ where: { "postId": postId } })

    if (!post) {
        return res.status(404).json({
            success: false,
            errorMessage: "해당 게시글을 찾을 수 없습니다."
        })
    }
    else if ( post.UserId !== userId ) {
        return res.status(401).json({
            success: false,
            message: "권한이 없습니다."
        })
    }
    await Posts.update({
        title: title,
        content: content
    },
    {
        where: {postId: postId}
    })
    return res.status(200).json({
        success: true,
        message: "해당 게시글이 수정되었습니다."
    })
})


// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { userId } = res.locals.user

    const post = await Posts.findOne({ where: { "postId": postId } })

    if (!post) {
        return res.status(404).json({
            success: false,
            errorMessage: "해당 게시글을 찾을 수 없습니다."
        })
    }
    else if ( post.UserId !== userId ) {
        return res.status(401).json({
            success: false,
            message: "권한이 없습니다."
        })
    }
    await Posts.destroy({ where: { "postId": postId } })
    return res.status(200).json({
        success: true,
        message: "해당 게시글이 삭제되었습니다."
    })
})

module.exports = router