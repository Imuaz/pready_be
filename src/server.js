import "dotenv/config";
import express from "express";


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        message: "Welcome Master backend API!",
        status: "Server is running",
        timestamp: new Date().toISOString()
    })
});





// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Visit: http://localhost:${PORT}`);
});