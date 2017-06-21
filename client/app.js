class App {
    constructor({ displayWinner, displayRound, displayMatch, initProgress, updateProgress, displayError }) {
        this.displayWinner = displayWinner
        this.displayRound = displayRound
        this.displayMatch = displayMatch
        this.initProgress = initProgress
        this.updateProgress = updateProgress
        this.displayError = displayError
    }

    getTournament({ teamsPerMatch, numberOfTeams }) {
        return new Promise((resolve, reject) => {
            // Store the input parameters
            this.teamsPerMatch = teamsPerMatch
            this.numberOfTeams = numberOfTeams

            // Calculat number of matches to draw progress boxes
            let remainingTeams = numberOfTeams
            let totalMatches = 0
            while (remainingTeams > 1) {
                totalMatches += remainingTeams / teamsPerMatch
                remainingTeams /= teamsPerMatch
            }
            ui.initProgress({ totalMatches })

            // Clear teams cache
            this.teams = {}

            // Request the tournament details from the server
            HTTP.post('/tournament', { teamsPerMatch, numberOfTeams })
            .then(tournament => {
                const { tournamentId, matchUps } = tournament
                const round = 0
                // Store the tournament details and resolve for the first round
                this.tournamentId = tournamentId
                resolve(matchUps)
            })
            // Handle error via UI or alert if unset
            .catch(error => this.displayError ? this.displayError(error) : alert(error))
        })
    }

    runRound({ round, matchUps }) {
        this.displayRound(round)

        // For each match
        Promise.all(matchUps.map(matchUp =>
            this.getMatch({ round, match: matchUp.match })
            .then(matchScore =>
                // Look up the each team by teamId for the match
                Promise.all(matchUp.teamIds.map(teamId => this.getTeam({ teamId })))
                // When all teams for the match have been retrieved
                .then(teams => new Promise((resolve, reject) => {
                    console.log({ teams })
                    const teamScores = teams.map(team => team.score)
                    // Find the winning score
                    this.getWinner({ teamScores, matchScore }).then(winningScore => {
                        // The winner is the team with the matching score and lowest teamId
                        const winner = teams
                                        .filter((team => team.score === winningScore))
                                        .sort((a, b) => a.teamId - b.teamId)
                                        .shift()
                        const losers = teams.filter((team => team.teamId !== winner.teamId))
                        losers.map(team => delete this.teams[team.teamId])

                        this.displayMatch({ winner, losers })

                        this.updateProgress()
                        resolve(winner)
                    })
                }))
            )
        ))
        // When all matches in the round have completed
        .then(winners => {
            if (winners.length == 1) {
                // Display the winner
                this.displayWinner(winners.shift().name)
            } else {
                // Setup next rount of matches
                const nextRound = round + 1
                const matchUps = this.nextRoundMatchUps({ nextRound, winners })
                // Run the next round (recursion)
                this.runRound({ round: nextRound, matchUps })
            }
        })
    }

    nextRoundMatchUps({ nextRound, winners }) {
        // Calculate the number of matches required for the next round
        const matches = winners.length / this.teamsPerMatch
        let matchUps = []
        // For each match, set the match object
        for (let i = 0; i < matches; i++) {
            let matchUp = {
                match: matchUps.length,
                teamIds: []
            }
            // Push ${teamsPerMatch} teams from the previous winners into each match
            for (let j = 0; j < this.teamsPerMatch; j++) {
                matchUp.teamIds.push(winners.shift().teamId)
            }
            matchUps.push(matchUp)
        }
        // Return the matchUps
        return matchUps
    }

    getMatch({ round, match }) {
        return new Promise((resolve, reject) => {
            // Retrieve the match score from the server
            HTTP.get('/match', { tournamentId: this.tournamentId, round, match })
            .then(response => resolve(response.score))
        })
    }

    getTeam({ teamId }) {
        return new Promise((resolve, reject) => {
            // Check if the team is in cache
            if (Object.keys(this.teams).includes(teamId)) resolve(this.teams[teamId])
            else {
                console.log(// Fetch the team from the server and cache before returning
                )
                HTTP.get('/team', { tournamentId: this.tournamentId, teamId })
                .then(team => resolve(this.teams[teamId] = team))
            }
        })
    }

    getWinner({ teamScores, matchScore }) {
        return new Promise((resolve, reject) => {
            // Retrieve the winning score for the match from the server
            HTTP.get('/winner', { tournamentId: this.tournamentId, teamScores, matchScore })
            .then(response => resolve(response.score))
        })
    }
}
