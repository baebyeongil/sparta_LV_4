const express = require("express")
const router = express.Router()
const User = require("../schemas/user.js")

// 정규식
const nicknamecheck = /^(?=.*[\da-zA-Z])[0-9a-zA-Z]{3,}$/;

// 회원가입 API
router.post("/users", async (req, res) => {
    const { nickname, password, confirmPassword } = req.body;
    const nicknames = await User.findOne({ nickname: nickname })

    if (nicknames) {
        return res.status(400).json({
            success: false,
            errorMessage: "중복된 닉네임이 존재합니다."
        })
    }
    else if (!nicknamecheck.test(nickname)) {
        return res.status(400).json({
            success: false,
            message: "닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성해 주세요."
        });
    }
    else if (password.length < 4 || password.includes(nickname)) {
        return res.status(400).json({
            success: false,
            errorMessage: "비밀번호는 최소 4자 이상, 닉네임과 같은 값이 포함될 수 없습니다."
        })
    }
    else if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
        })
    }
    await User.create({
        nickname: nickname,
        password: password
    })
    res.status(201).json({
        success: true,
        message: "계정이 생성되었습니다."
    })
});

module.exports = router;