const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        requird: true,
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    nickname: {},
    UserId: {}
}, {
    versionKey: false,
})

// 가상의 postId 값을 할당
postSchema.virtual("postId").get(function () {
    return this._id.toHexString();
});

// user 정보를 JSON으로 형변환 할 때 virtual 값이 출력되도록 설정
postSchema.set("toJSON", {
    virtuals: true,
});

module.exports = mongoose.model("Posts", postSchema);