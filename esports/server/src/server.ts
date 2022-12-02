import express from 'express'
import session from 'express-session';
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import config from "./config.json"

const app = express()

app.use(express.json())
app.use(session({
  secret: "secret",
  cookie: {
    maxAge: 86400000,
  },
  resave: true,
  saveUninitialized: false
}))
app.use(cors())

const prisma = new PrismaClient({
  log: ['query']
})

app.get('/', async (request, response) => {
  if(!request.session.cookie){
    response.redirect('/login')
  } else {
    response.status(200).json({
      user: request.session.save
    })
  }
})

app.get('/login', async (request, response) => {
  response.redirect(`https://discord.com/api/oauth2/authorize` + 
  `?client_id=${config.oauth2.client_id}` +
  `&redirect_uri=${encodeURIComponent(config.oauth2.redirect_uri)}` +
  `&response_type=code&scope=${encodeURIComponent(config.oauth2.scopes.join(" "))}`);
})

app.get("/login/callback", async (request, response) => {
  // Pega o código de acesso da URL(Conhecido como Query)
  const accessCode = request.query.code;

  // Caso não seja enviado esse código, ele redireciona para a rota principal
  if (!accessCode) return response.redirect("/");


  // Gera um formulário para ser enviado no corpo da requisição na API do Discord
  const data = new FormData();
  data.append("client_id", config.oauth2.client_id);
  data.append("client_secret", process.env.CLIENT_SECRET);
  data.append("grant_type", "authorization_code");
  data.append("redirect_uri", config.oauth2.redirect_uri);
  data.append("scope", "identify");
  // data.append("code", accessCode);

  // Faz a requisição do Token de Acesso na API do discord com todos os dados de acesso da aplicação
  const json = await (await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: data
  })).json(); // Exporta os dados em formato JSON.

app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        }
      }
    }
  })
  return response.json(games)
})

app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  const body = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      // hourStart: convertHourStringToMinutes(body.hourStart),
      // hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel
    }
  })

  return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) => {

  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourStart)
    }
  }))
})

app.get('/ads/:id/discord', async (request, response) => {

  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId
    }
  })

  return response.json({
    discord: ad.discord,
  })

})

app.listen(3333)