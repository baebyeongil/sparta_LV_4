const express = require("express")
const cookieParser = require("cookie-parser")
const usersRouter = require("./routes/user")
const postsRouter = require("./routes/post")
const authRouter = require("./routes/auth")
// const { sequelize } = require("./models/index.js")
const app = express()
const PORT = 3000

// async function main() {
//   await sequelize.sync();
// }

// main()

app.use(express.json())
app.use(cookieParser())
app.use('/api', [usersRouter, postsRouter, authRouter])

app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.')
})