const express=require("express");
const cors=require("cors")
const connectedDb=require("./models/db")
require("dotenv").config();
const sessions=require("express-session")
const {MongoStore}=require("connect-mongo");
const {createServer}=require("http");
const {Server}=require("socket.io");
const authRouter = require("./routes/authRooute");
const app=express();
app.use(express.json());
app.use(cors({
  origin:"*",
  credentials:true
}))
connectedDb()
app.use(sessions({
  secret:process.env.SECRET_KEY|| "smmwbnerhmlwht299yhtbeefenbbbfbbbdvgd",
  saveUninitialized:false,
  resave:false,
  cookie:{
    maxAge:60*60*24,
    secure:false,
    httpOnly:false,
    sameSite:"lax"
  },
  store:MongoStore.create({
    mongoUrl:process.env.MONGODB_URL,
    ttl:60*60*2
  })
}))
const server= new createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*",
    credentials:true
  }

})
app.use("/user",authRouter)
const port=process.env.PORT || 5000
server.listen(port,()=>{
  console.log("The Server Is running on",port)
})
