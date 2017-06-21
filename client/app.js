const App = {
    init: ({ displayWinner, displayRound, displayMatch, displayProgress, displayError }) => {
        App.displayWinner = displayWinner
        App.displayRound = displayRound
        App.displayMatch = displayMatch
        App.displayProgress = displayProgress
        App.displayError = displayError
    },

    getTournament: ({ teamsPerMatch, numberOfTeams }) => new Promise((resolve, reject) => {
        // Store the input parameters
        Cache.set(APP, 'teamsPerMatch', teamsPerMatch)
        Cache.set(APP, 'numberOfTeams', numberOfTeams)

        // Request the tournament details from the server
        HTTP.post('/tournament', { teamsPerMatch, numberOfTeams })
        .then(tournament => {
            const { tournamentId, matchUps } = tournament
            const round = 0
            // Store the tournament details and resolve for the first round
            Cache.set(APP, TOURNAMENT, tournamentId)
            Cache.set(ROUND, round, matchUps)
            resolve(round)
        })
        // Handle error via UI or alert if unset
        .catch(error => App.displayError ? App.displayError(error) : alert(error))
    }),

    runRound: ({ round }) => {
        App.displayRound(round)

        // For each match
        const matches = Cache.get(ROUND, round)
        let [ completed, pending ] = [ 0, matches.length ]
        App.displayProgress({ round, completed, pending})
        Promise.all(matches.map(matchUp =>
            App.getMatch({ round, match: matchUp.match })
            .then(matchScore =>
                // Look up the each team by teamId for the match
                Promise.all(matchUp.teamIds.map(teamId => App.getTeam({ teamId })))
                // When all teams for the match have been retrieved
                .then(teams => new Promise((resolve, reject) => {
                    const teamScores = teams.map(team => team.score)
                    // Find the winning score
                    App.getWinner({ teamScores, matchScore }).then(winningScore => {
                        // The winner is the first team with the matching score
                        const winner = teams.find((team => team.score === winningScore))
                        const losers = teams.filter((team => team.teamId !== winner.teamId))

                        App.displayMatch({ winner, losers })

                        App.displayProgress({ round, completed: ++completed, pending: --pending })
                        resolve(winner)
                    })
                }))
            )
        ))
        // When all matches in the round have completed
        .then(winners => {
            if (winners.length == 1) {
                // Display the winner
                App.displayWinner(`${winners.shift().name} is the Winner.`)
            } else {
                // Setup next rount of matches
                const nextRound = round + 1
                App.nextRoundMatchUps({ nextRound, winners })
                // Run the next round (recursion)
                App.runRound({ round: nextRound })
            }
        })
    },

    nextRoundMatchUps: ({ nextRound, winners }) => {
        // Calculate the number of matches required for the next round
        const teamsPerMatch = Cache.get(APP, 'teamsPerMatch')
        const matches = winners.length / teamsPerMatch
        let matchUps = []
        // For each match, set the match object
        for (let i = 0; i < matches; i++) {
            let matchUp = {
                match: matchUps.length,
                teamIds: []
            }
            // Push ${teamsPerMatch} teams from the previous winners into each match
            for (let j = 0; j < teamsPerMatch; j++) {
                matchUp.teamIds.push(winners.shift().teamId)
            }
            matchUps.push(matchUp)
        }
        // Store the matchUps
        Cache.set(ROUND, nextRound, matchUps)
    },

    getMatch: ({ round, match }) => new Promise((resolve, reject) => {
        // Retrieve the match score from the server
        const tournamentId = Cache.get(APP, TOURNAMENT)
        HTTP.get('/match', { tournamentId, round, match })
        .then(response => resolve(response.score))
    }),

    getTeam: ({ teamId }) => new Promise((resolve, reject) => {
        // Check if the team is in cache
        if (team = Cache.get(TEAM, teamId)) resolve(team)
        else {
            // Fetch the team from the server and cache before returning
            const tournamentId = Cache.get(APP, TOURNAMENT)
            HTTP.get('/team', { tournamentId, teamId })
            .then(team => {
                Cache.set(TEAM, teamId, team)
                resolve(team)
            })
        }
    }),

    getWinner: ({ teamScores, matchScore }) => new Promise((resolve, reject) => {
        // Retrieve the winning score for the match from the server
        const tournamentId = Cache.get(APP, TOURNAMENT)
        HTTP.get('/winner', { tournamentId, teamScores, matchScore })
        .then(response => resolve(response.score))
    })
}
