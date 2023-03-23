const express = require('express')
const request = require('request')
const app = express()

app.use(express.json({extended: true, limit: '1mb'}))

const mjerticla_id = 6600634

const civ_mapping = {
    'holy_roman_empire': 'HRE',
    'rus': 'RUS',
    'mongols': 'Mongol',
    'chinese': 'China',
    'delhi_sultanate': 'Delhi',
    'english': 'ENG',
    'ottomans': 'Otto',
    'abbasid_dynasty': 'Abba',
    'french': 'FR',
    'malians': 'Malian'
}

app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})

app.all('/rank', (req, res) => {
    console.log("Test")
    res.send("Perfect <3")
})

app.get('/rank/:name', (req, res) => {
    const player_name = req.params.name

    request.get({
        url: "https://aoe4world.com/api/v0/players/search?query=" + player_name ,
        json: true
    }, (error, response) => {
        let body = response.body
        if (error) {
            return res.send("Something went wrong! HEEEEELP");
        }

        let answer = 'Player: ' + body.players[0].name + " <-> "

        if (body.players.length === 0) {
            res.send('No player with the name - ' + player_name + ' - was found.')
        }
        if (body.players[0].leaderboards.rm_solo) {
            answer = answer + '\n' + '[Solo] - ' +
                body.players[0].leaderboards.rm_solo.rank_level + ' - ' +
                body.players[0].leaderboards.rm_solo.rating + ' <-> '
        } else {
            answer = answer + '\n' + '[Solo] - Unranked <-> '
        }
        if (body.players[0].leaderboards.rm_team) {
            answer = answer + '\n' + '[Team] - ' +
                body.players[0].leaderboards.rm_team.rank_level + ' - ' +
                body.players[0].leaderboards.rm_team.rating
        } else {
            answer = answer + '\n' + '[Team] - Unranked'
        }
        res.send(answer)
    })
})

app.all('/match', (req, res) => {
    request.get({
        url: "https://aoe4world.com/api/v0/players/" + String(mjerticla_id) + "/games",
        json: true
    }, (error, response) => {
        let body = response.body
        if (error) {
            return res.send("Something went wrong! HEEEEELP");
        }
        let last_game = body.games[0]  // get last game
        if (last_game.ongoing) {
            let answer = "["
            answer = answer + last_game.server + "]"
            answer = answer + " <-> " + last_game.map
            const teams = last_game.teams
            for (let i = 0; i < teams.length; i++) {
                if (i == 0) {
                    answer = answer + " <-> ["
                } else {
                    answer = answer + " VS ["
                }
                for (let j = 0; j < teams[i].length; j++) {
                    const player = teams[i][j].player
                    const player_civ_name = "(" + civ_mapping[player.civilization] + ")" + player.name 
                    if (j == 0) {
                        answer = answer + player_civ_name
                    } else {
                        answer = answer + " + " + player_civ_name
                    }
                    if (player.rating) {
                        answer = answer + "(" + player.rating + ")"
                    }
                }
                answer = answer + "]"
            }
            res.send(answer)
        } else {
            res.send("O teu streamer favorito não está a jogar nenhum jogo :(")
        }
    })
})

app.get('/match/:name', (req, res) => {
    const player_name = req.params.name
    console.log(player_name)
    let player_id = 0

    // get user id
    request.get({
        url: "https://aoe4world.com/api/v0/players/search?query=" + player_name,
        json: true
    }, (error, response) => {
        console.log(response)
        let body = response.body
        if (error) {
            return res.send("Não encontrei o nome desse jogador");
        }
        console.log("--body--")
        console.log(body.players[0])
        player_id = body.players[0].profile_id

            console.log(player_id === 0)
        console.log(player_id)
        if (player_id === 0) {
            res.send("Não encontrei o nome desse jogador.")
        }
        request.get({
            url: "https://aoe4world.com/api/v0/players/" + String(player_id) + "/games",
            json: true
        }, (error, response) => {
            let body = response.body
            if (error) {
                return res.send("Something went wrong! HEEEEELP");
            }
            let last_game = body.games[0]  // get last game
            if (last_game.ongoing) {
                let answer = "["
                answer = answer + last_game.server + "]"
                answer = answer + " <-> " + last_game.map
                const teams = last_game.teams
                for (let i = 0; i < teams.length; i++) {
                    if (i === 0) {
                        answer = answer + " <-> ["
                    } else {
                        answer = answer + " VS ["
                    }
                    for (let j = 0; j < teams[i].length; j++) {
                        const player = teams[i][j].player
                        const player_civ_name = "(" + civ_mapping[player.civilization] + ")" + player.name
                        if (j === 0) {
                            answer = answer + player_civ_name
                        } else {
                            answer = answer + " + " + player_civ_name
                        }
                        if (player.rating) {
                            answer = answer + "(" + player.rating + ")"
                        }
                    }
                    answer = answer + "]"
                }
                res.send(answer)
            } else {
                res.send("Esse jogador não está a jogar nenhum jogo... :(")
            }
        })
    })
})


app.get('/gpt/:text', async (req, res) => {
    const text = req.params.text
    const { Configuration, OpenAIApi } = require("openai");

    console.log(process.env.OPENAI_API_KEY)
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    prompt = "Assume o papel de um rapaz chamado Diogo, por isso responde sempre em primeira pessoa.\n"
    prompt = prompt + "Olá a todos! O meu nome é Diogo, vivo em Portugal e adoro gaming! Gosto de RTS, FPS e sobrevivência, por agora estou mais focado no Age of Empires 4.\n"
    prompt = prompt + "Twitter: https://twitter.com/mjerticla ~ YouTube: https://www.youtube.com/@mjerticla\n"
    prompt = prompt + "UtinOwns vs DavidB, showmatch bo3, quinta-feira, 21h30min (PT) 18h30min (BR).\n"
    prompt = prompt + "O cartel é o meu cão.\n"
    prompt = prompt + "\nCom base no teu resumo de vida responde.\nQ:" + text + "\nA:"
    
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 128,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    if (response.data.choices) {
        res.send(response.data.choices[0].text)
    } else {
        res.send("De momento deu bosta. Tenta mais tarde <3")
    }
})

app.listen(process.env.PORT || 3000)
