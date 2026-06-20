const express = require("express");
const app = express();
const PORT= process.env.PORT || 8000



app.get("/", (req, res) => {
    res.send("server is running just okay!!!!")
})

app.listen(PORT,()=>{
    console.log(`app is running on port ${PORT}`)
})