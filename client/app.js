class App {
    constructor({ ui, http, debug }) {
        this.ui = ui
        this.http = http
        this.debug = debug ? true : false
    }
  
    validateInput({ teamsPerMatch, numberOfTeams }) {
      if (isNaN(teamsPerMatch) || teamsPerMatch < 2) return false
      if (isNaN(numberOfTeams) || numberOfTeams < 2) return false
      return true
    }

    getTournament({ teamsPerMatch, numberOfTeams }) {
        return new Promise((resolve, reject) => {
            // Store the input parameters
            this.teamsPerMatch = teamsPerMatch
            this.numberOfTeams = numberOfTeams

            // Clear teams cache
            this.teams = {}

            // Request the tournament details from the server
            this.http.post(0, '/tournament', { teamsPerMatch, numberOfTeams })
                .then(tournament => {
                    // Calculate number of matches to draw progress boxes
                    let remainingTeams = numberOfTeams
                    let totalMatches = 0
                    while (remainingTeams > 1) {
                        totalMatches += remainingTeams / teamsPerMatch
                        remainingTeams /= teamsPerMatch
                    }
                    this.ui.initProgress(totalMatches)

                    const { tournamentId, matchUps } = tournament
                    const round = 0
                    // Store the tournament details and resolve for the first round
                    this.tournamentId = tournamentId
                    resolve(matchUps)
                })
                // Handle error via UI
                .catch(error => this.ui.displayError(error))
        })
    }

    runRound({ round, matchUps }) {
        if (this.debug) console.log(`Round ${(round + 1)}`)

        // Array of promises which resolve the winner of each match 
        Promise.all(matchUps.map(matchUp =>
            this.getMatch({ round, match: matchUp.match })
                .then(matchScore =>
                    // Look up the each team by teamId for the match
                    Promise.all(matchUp.teamIds.map(teamId => this.getTeam({ match: matchUp.match, teamId })))
                        // When all teams for the match have been retrieved
                        .then(teams => new Promise((resolve, reject) => {
                            const teamScores = teams.map(team => team.score)
                            // Find the winning score
                            this.getWinner({ teamScores, matchScore }).then(winningScore => {
                                // The winner is the team with the matching score and lowest teamId
                                const winner = teams
                                    .filter((team => team.score === winningScore))
                                    .sort((a, b) => a.teamId - b.teamId)
                                    .shift()

                                // Remove losers from the local storage
                                const losers = teams.filter((team => team.teamId !== winner.teamId))
                                losers.map(team => delete this.teams[team.teamId])

                                // Update UI and return winner
                                if (this.debug) console.log(`${winner.name} defeated ${losers.map(team => team.name).join(", ")}`)
                                this.ui.updateProgress()
                                resolve(winner)
                            })
                        }))
                )
        ))
            // When all matches have been resolved
            .then(teams => {
                if (teams.length == 1) {
                    // Display the winner
                    this.ui.displayWinner(teams.shift().name)
                } else {
                    // Setup next rount of matches
                    const matchUps = this.nextRoundMatchUps({ teams })
                    // Run the next round (recursion)
                    this.runRound({ round: (round + 1), matchUps })
                }
            })
    }

    nextRoundMatchUps({ teams }) {
        // Calculate the number of matches required for the next round
        const matches = teams.length / this.teamsPerMatch
        let matchUps = []
        // For each match, set the match object
        for (let i = 0; i < matches; i++) {
            let matchUp = {
                match: matchUps.length,
                teamIds: []
            }
            // Push ${teamsPerMatch} teams into each match
            for (let j = 0; j < this.teamsPerMatch; j++) {
                matchUp.teamIds.push(teams.shift().teamId)
            }
            matchUps.push(matchUp)
        }
        // Return the matchUps
        return matchUps
    }

    getMatch({ round, match }) {
        return new Promise((resolve, reject) => {
            // Retrieve the match score from the server
            this.http.get(match, '/match', { tournamentId: this.tournamentId, round, match })
                .then(response => resolve(response.score))
        })
    }

    getTeam({ match, teamId }) {
        return new Promise((resolve, reject) => {
            // Check if the team is in cache
            if (this.teams[teamId]) resolve(this.teams[teamId])
            else {
                // Fetch the team from the server and cache before returning
                this.http.get(match, '/team', { tournamentId: this.tournamentId, teamId })
                    .then(team => resolve(this.teams[teamId] = team))
            }
        })
    }

    getWinner({ teamScores, matchScore }) {
        return new Promise((resolve, reject) => {
            // Retrieve the winning score for the match from the server
            this.http.get(1, '/winner', { tournamentId: this.tournamentId, teamScores, matchScore })
                .then(response => resolve(response.score))
        })
    }
}
