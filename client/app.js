const App = {
    getTournament: ({ teamsPerMatch, numberOfTeams }) => new Promise((resolve, reject) => {
        HTTP.post('/tournament', { teamsPerMatch, numberOfTeams })
        .then(tournament => {
            const { tournamentId, matchUps } = tournament
            const round = 0
            Cache.set(APP, TOURNAMENT, tournamentId)
            Cache.set(ROUND, round, matchUps)
            resolve(round)
        })
    }),

    runRound: ({ round }) => {
        App.displayRound(round)
        const winners = []
        Promise.all(Cache.get(ROUND, round).map(matchUp =>
            App.getMatch({ round, match: matchUp.match })
            .then(matchScore => {
                const getTeams = matchUp.teamIds.map(teamId => App.getTeam({ teamId }))
                return Promise.all(getTeams)
                .then(teams => new Promise((resolve, reject) => {
                    const teamScores = teams.map(team => team.score)
                    App.getWinner({ teamScores, matchScore }).then(winningScore => {
                        const winner = teams.find((team => team.score === winningScore))
                        const losers = teams.filter((team => team.teamId !== winner.teamId))
                        App.displayMatch({ winner, losers })

                        resolve(winner)
                    })
                }))
            })
        ))
        .then(winners => {
            const nextRound = round + 1
            if (winners.length > 1) {
                App.nextRoundMatchUps({ nextRound, winners })
                App.runRound({ round: nextRound })
            } else {
                const team = winners.shift()
                console.log(`${team.name} is the Winner.`)
                App.displayWinner(`${team.name} is the Winner.`)
            }
        })
    },

    nextRoundMatchUps: ({ nextRound, winners }) => {
        const teamsPerMatch = Cache.get(APP, 'teamsPerMatch')
        const matches = winners.length / teamsPerMatch
        let matchUps = []
        for (let i = 0; i < matches; i++) {
            let matchUp = {
                match: matchUps.length,
                teamIds: []
            }
            for (let j = 0; j < teamsPerMatch; j++) {
                matchUp.teamIds.push(winners.shift().teamId)
            }
            matchUps.push(matchUp)
        }
        Cache.set(ROUND, nextRound, matchUps)
    },

    getMatch: ({ round, match }) => new Promise((resolve, reject) => {
        const tournamentId = Cache.get(APP, TOURNAMENT)
        HTTP.get('/match', { tournamentId, round, match })
        .then(response => resolve(response.score))
    }),

    getTeam: ({ teamId }) => new Promise((resolve, reject) => {
        if (team = Cache.get(TEAM, teamId)) resolve(team)
        else {
            const tournamentId = Cache.get(APP, TOURNAMENT)
            HTTP.get('/team', { tournamentId, teamId })
            .then(team => {
                Cache.set(TEAM, teamId, team)
                resolve(team)
            })
        }
    }),

    getWinner: ({ teamScores, matchScore }) => new Promise((resolve, reject) => {
        const tournamentId = Cache.get(APP, TOURNAMENT)
        HTTP.get('/winner', { tournamentId, teamScores, matchScore })
        .then(response => resolve(response.score))
    }),

    displayWinner: (winner) => {
        document.getElementById('winner').innerHTML = winner
        document.getElementById('shade').className = "visible"
    },

    displayRound: (round) => {
        const h2 = document.createElement('h2')
        h2.setAttribute('id', `round_${round}`)
        h2.className = 'results_round'
        h2.textContent = `Round ${(round + 1)}`
        document.getElementById('results').appendChild(h2)
    },

    displayMatch: ({ winner, losers }) => {
        const p = document.createElement('p')
        p.className = 'results_match'
        p.innerHTML = `${winner.name} <i>defeated</i> ${losers.map(team => team.name).join(', ')}`
        document.getElementById('results').appendChild(p)
    }
}
