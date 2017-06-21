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
        App.teamsPerMatch = teamsPerMatch
        App.numberOfTeams = numberOfTeams

        // Request the tournament details from the server
        HTTP.post('/tournament', { teamsPerMatch, numberOfTeams })
        .then(tournament => {
            const { tournamentId, matchUps } = tournament
            const round = 0
            // Store the tournament details and resolve for the first round
            App.tournamentId = tournamentId
            resolve(matchUps)
        })
        // Handle error via UI or alert if unset
        .catch(error => App.displayError ? App.displayError(error) : alert(error))
    }),

    runRound: ({ round, matchUps }) => {
        App.displayRound(round)

        // For each match
        let [ completed, pending ] = [ 0, matchUps.length ]
        App.displayProgress({ round, completed, pending})
        Promise.all(matchUps.map(matchUp =>
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
                        losers.map(team => App.teams.clear(team.teamId))

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
                const matchUps = App.nextRoundMatchUps({ nextRound, winners })
                // Run the next round (recursion)
                App.runRound({ round: nextRound, matchUps })
            }
        })
    },

    nextRoundMatchUps: ({ nextRound, winners }) => {
        // Calculate the number of matches required for the next round
        const { teamsPerMatch } = App
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
        // Return the matchUps
        return matchUps
    },

    getMatch: ({ round, match }) => new Promise((resolve, reject) => {
        // Retrieve the match score from the server
        const { tournamentId } = App
        HTTP.get('/match', { tournamentId, round, match })
        .then(response => resolve(response.score))
    }),

    getTeam: ({ teamId }) => new Promise((resolve, reject) => {
        // Check if the team is in cache
        if (team = App.teams.get(teamId)) resolve(team)
        else {
            // Fetch the team from the server and cache before returning
            const { tournamentId } = App
            HTTP.get('/team', { tournamentId, teamId })
            .then(team => {
                App.teams.set(teamId, team)
                resolve(team)
            })
        }
    }),

    teams: {
        t: {},

        // retrieve stored values by store, key
        get: function (key) { return (this.t[key]) ? this.t[key] : undefined },

        // setup objects and store value
        set: function (key, value) {
            if (!this.t) this.t = {}
            return this.t[key] = value
        },

        // remove objects from store
        clear: function (key) { (this.t[key]) ? delete this.t[key] : null }
    },

    getWinner: ({ teamScores, matchScore }) => new Promise((resolve, reject) => {
        // Retrieve the winning score for the match from the server
        const { tournamentId } = App
        HTTP.get('/winner', { tournamentId, teamScores, matchScore })
        .then(response => resolve(response.score))
    })
}
