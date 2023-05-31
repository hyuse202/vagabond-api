const express = require('express')
const cors = require('cors')
const axios = require('axios');
const cheerio = require('cheerio')
const bodyParse =require('body-parser')
const dotenv = require('dotenv');

//set up
const app = express();
const urlChars = 'https://vagabond.fandom.com/wiki/Category:Characters';
const url = 'https://vagabond.fandom.com/wiki/'
app.use(bodyParse.json({limit : "50mb"}));
app.use(cors());
dotenv.config();
app.use(
    bodyParse.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 5000,
    })
)
//route
app.get("/v1", (req, resp)=>{
    const thumbnails = [];
    try{
        axios(urlChars).then((res) =>{
            const html = res.data;
            const $ = cheerio.load(html);
            $("li.category-page__trending-page", html).each(function(){
                const url = $(this).find("a").attr("href");
                const name = $(this).find("a > figure > figcaption").text();
                const img = $(this).find("a > figure > img").attr("src");
                thumbnails.push({
                    name: name,
                    url: "http://localhost:5500/v1" + url.split("/wiki")[1],
                    img: img
                })
            })
            resp.status(200).json(thumbnails);
    })
        
    }
    catch(err){
        resp.status(500).json(err);
    }
})

app.get("/v1/:char", (req, resp) => {
    const urlChar = url + req.params.char;
    const titles = [];
    const details = [];
    const charObj = {};
    const char = [];
    try{
        axios(urlChar).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            $("aside",html).each(function(){
                $(this).find("section > div > h3").each(function(){
                    const title = $(this).text();
                    titles.push(title);
                })
                $(this).find("section > div > div").each(function(){
                    const detail = $(this).text();
                    details.push(detail);
                })
            })
            for(let i = 0; i < titles.length; i++)
                charObj[titles[i]] = details[i];
            char.push({...charObj});
            resp.status(200).json(char);
        })
    }
    catch(err){
        resp.status(500).json(err);
    }
})

app.listen(5500, ()=>{
    console.log("server is running...");
})
