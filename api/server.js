
import express from 'express'
import { PORT } from './config/config.js'
const app = express()
import cors from 'cors'
import { appRouter } from './router/router.js'
import './bot/bot.js'


app.use(cors({
    origin: ['http://127.0.0.1:5500'],
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

appRouter(app)

app.use((error, req, res, next) => { 
    console.log(error);

    return res.status(500).send({
        success: false,
        error: "Serverda ichki xatolik!",
    });
});

const port = PORT || 3000
app.listen(port, () => {
    console.log(`Server ${port}-portda ishga tushdi...`);
})