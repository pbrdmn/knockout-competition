// Edit me.
// Feel free to add other JS files in this directory as you see fit.

document.addEventListener("DOMContentLoaded", (event) => {
    App.init();
});

const [ APP, TOURNAMENT, ROUND, MATCH, TEAM ] = [ 'APP', 'TOURNAMENT', 'ROUND', 'MATCH', 'TEAM' ]

const Cache = {
    data: {},

    get: (store = 'APP', key) => (Cache.data && Cache.data[store]) ? Cache.data[store][key] : undefined,

    set: (store = 'APP', key, value) => {
        if (!Cache.data) Cache.data = {}
        if (!Cache.data[store]) Cache.data[store] = {}
        return Cache.data[store][key] = value
    }
}

const HTTP = {
    post: (url, data) => new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                resolve(JSON.parse(request.responseText))
            } else {
                const response = JSON.parse(request.responseText)
                if (response.error) {
                    reject(response.message)
                }
            }
        };

        request.onerror = function() {
            reject({ message:'Connection Error', error: true })
        };

        const params = HTTP.params(data)
        request.send(params);
    }),

    get: (url, data) => new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url + '?' + HTTP.params(data), true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                resolve(JSON.parse(request.responseText));
            } else {
                reject(JSON.parse(request.responseText));
            }
        };

        request.onerror = function() {
            reject({ message:'Connection Error', error: true });
        };

        request.send();
    }),

    params: (data) => {
        return Object.keys(data).map((key) => {
            if (Array.isArray(data[key])) {
                return data[key].map(value => key + '[]=' + encodeURIComponent(value)).join('&')
            } else {
                return key + '=' + encodeURIComponent(data[key]);
            }
        }).join('&')
    }
}

const App = {
    init: () => {
        document.getElementById("start").addEventListener("click", (event) => {
            const teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
            const numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)

            Cache.set(APP, 'teamsPerMatch', teamsPerMatch);
            Cache.set(APP, 'numberOfTeams', numberOfTeams);

            App.getTournament({ teamsPerMatch, numberOfTeams })
            .then(round => App.runRound({ round }))
            .catch(error => alert(error.message))
        })
    },
    
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
        console.log(`# Round ${round}`)
        const winners = []
        Promise.all(Cache.get(ROUND, round).map(matchUp => {
            const { match } = matchUp
            return App.getMatch({ round, match })
            .then(matchScore =>
                Promise.all(matchUp.teamIds.map(teamId => App.getTeam({ teamId })))
                .then(teams => new Promise((resolve, reject) => {
                    const teamScores = teams.map(team => team.score)
                    App.getWinner({ teamScores, matchScore }).then(winningScore => {
                        const winner = teams.find((team => team.score === winningScore))
                        const losers = teams.filter((team => team.teamId !== winner.teamId))
                        console.log(`- Match ${match}: ${winner.name} defeated ${losers.map(team => team.name).join(', ')}`, { losers })

                        resolve(winner)
                    })
                }))
            )
        }))
        .then(winners => {
            const nextRound = round + 1
            if (winners.length > 1) {
                App.nextRoundMatchUps({ nextRound, winners })
                App.runRound({ round: nextRound })
            } else {
                const team = winners.shift()
                console.log(`Winning team is ${team.name}`)
                App.winnerDisplay(`Winning team is ${team.name}`)
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
        console.log({ nextRound, matchUps })
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

    winnerDisplay: (winner) => {
        document.getElementById('winner').innerHTML = winner
    }
}