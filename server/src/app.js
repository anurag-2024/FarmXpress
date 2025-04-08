const express = require('express')
const morgan = require('morgan')
const app = express()
const port = 3000

const cors=require('cors')
const connectDB=require("./config/database")
const profileRouter=require("./routes/profile");
const authRouter=require("./routes/auth");
const scheduleDeliveryRouter= require("./routes/scheduleDelivery");
const mergeRouter=require('./routes/merge');

const cookieParser=require('cookie-parser');
const viewCompanyRouter = require('./routes/viewCompany');

app.use(cors({
  origin:["http://localhost:5173"],
  methods: "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  credentials:true,
}));

app.use(morgan('tiny'))
app.get('/', (req, res) => {
  res.send('Server is running')
})

app.use(express.json());
app.use(cookieParser())

app.use('/', profileRouter);
app.use('/', authRouter);
app.use('/',scheduleDeliveryRouter);
app.use('/',viewCompanyRouter);
app.use('/',mergeRouter);

connectDB().then(() => {
  console.log("Connection established successfully");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
.catch((err) => {
  console.error("Cannot connect to DB: " + err);
});