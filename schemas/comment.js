const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    postId: {},
    nickname: {},
    UserId: {},
    comment: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    }
}, {
    versionKey: false,
})

// 가상의 userId 값을 할당
commentSchema.virtual("commentId").get(function () {
    return this._id.toHexString();
});

// user 정보를 JSON으로 형변환 할 때 virtual 값이 출력되도록 설정
commentSchema.set("toJSON", {
    virtuals: true,
});

const comnnets = mongoose.model("Comments", commentSchema);

module.exports = comnnets