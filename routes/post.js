const express = require("express")
const router = express.Router()
const Posts = require("../schemas/post.js")
const Users = require("../schemas/user.js")
const authMiddleware = require("../middlewares/auth-middleware.js")

// 전체 게시글 조회
router.get("/posts", async (req, res) => {
    const allPosts = await Posts.find().sort("-date").exec()

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

    const post = await Posts.findOne({ "_id": postId })

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
    const { userId } = res.locals.user;
    const { title, content } = req.body;
    
    const user = await Users.findOne({ "_id": userId })

    if (!user) {
        return res.status(404).json({
            success: false,
            errorMessage: "로그인이 필요한 기능입니다."
        })
    }
    const post = await Posts.create({
        UserId : userId,
        nickname : user.nickname,
        title : title,
        content : content,
    });

    return res.status(201).json({ data: post });
});

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { userId } = res.locals.user
    const { title, content, } = req.body

    const post = await Posts.findOne({ "_id": postId })

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
    await Posts.updateOne(
        { "_id": postId },
        {
            $set: {
                title: title,
                content: content,
                date: new Date,
            }
        }
    )
    return res.status(200).json({
        success: true,
        message: "해당 게시글이 수정되었습니다."
    })
})


// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params
    const { userId } = res.locals.user

    const post = await Posts.findOne({ "_id": postId })

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
    await Posts.deleteOne({ "_id": postId })
    return res.status(200).json({
        success: true,
        message: "해당 게시글이 삭제되었습니다."
    })
})

module.exports = router