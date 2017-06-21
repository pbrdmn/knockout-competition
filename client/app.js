const App = {
    init: ({ displayWinner, displayRound, displayMatch }) => {
        App.displayWinner = displayWinner;
        App.displayRound = displayRound;
        App.displayMatch = displayMatch;
    },

    getTournament: ({ teamsPerMatch, numberOfTeams }) => new Promise((resolve, reject) => {
        Cache.set(APP, 'teamsPerMatch', teamsPerMatch);
        Cache.set(APP, 'numberOfTeams', numberOfTeams);

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
    })
}
