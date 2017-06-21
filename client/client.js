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

const App = {
    init: () => {
        document.getElementById("start").addEventListener("click", (event) => {
            const teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
            const numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)

            App.run({ teamsPerMatch, numberOfTeams })
            .then(() => App.runRound())
            .catch(error => alert(error.message))
        })
    },

    run: ({ teamsPerMatch, numberOfTeams }) => {
        console.log("Creating Tournament")

        App.teamsPerMatch = teamsPerMatch;
        App.numberOfTeams = numberOfTeams;

        return App.getTournament({ teamsPerMatch, numberOfTeams })
    },
    
    getTournament: ({ teamsPerMatch, numberOfTeams }) => new Promise((resolve, reject) => {
        console.log('App.getTournament', { teamsPerMatch, numberOfTeams })
        var request = new XMLHttpRequest();
        request.open('POST', '/tournament', true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                const { tournamentId, matchUps } = JSON.parse(request.responseText);
                const roundId = 0
                Cache.set(APP, ROUND, roundId)
                Cache.set(APP, TOURNAMENT, tournamentId)
                Cache.set(ROUND, roundId, matchUps)
                resolve()
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

        request.send(`teamsPerMatch=${teamsPerMatch}&numberOfTeams=${numberOfTeams}`);
    }),

    runRound: () => {
        const roundId = Cache.get(APP, ROUND)
        Cache.get(ROUND, roundId).map(matchUp => {
            App.getMatch(roundId, matchUp.match).then(matchScore => {
                console.log(`Round ${roundId} match ${matchUp.match}`, { matchScore })
                const matches = matchUp.teamIds.map(teamId => App.getTeam(teamId))
                Promise.all(matches).then(teams => {
                    console.log(teams)
                    const scores = teams.map(team => team.score)
                })
            })
        })
    },

    getMatch: (round, match) => new Promise((resolve, reject) => {
        const tournamentId = Cache.get(APP, TOURNAMENT)
        var request = new XMLHttpRequest();
        request.open('GET', `/match?tournamentId=${tournamentId}&round=${round}&match=${match}`, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                const { score } = JSON.parse(request.responseText);
                resolve(score);
            } else {
                reject(JSON.parse(request.responseText));
            }
        };

        request.onerror = function() {
            reject({ message:'Connection Error', error: true });
        };

        request.send();
    }),

    getTeam: teamId => new Promise((resolve, reject) => {
        const team = Cache.get(TEAM, teamId)
        if (typeof team !== 'undefined') {
            console.log('App.getTeam cache resolve', team)
            resolve(team)
        } else {
            const tournament = Cache.get(APP, TOURNAMENT)
            var request = new XMLHttpRequest();
            request.open('GET', `/team?tournamentId=${tournament}&teamId=${teamId}`, true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    const team = JSON.parse(request.responseText)
                    console.log('App.getTeam request resolve', team)
                    Cache.set(TEAM, teamId, team)
                    resolve(team)
                } else {
                    reject(JSON.parse(request.responseText));
                }
            };

            request.onerror = function() {
                reject({ message:'Connection Error', error: true })
            };

            request.send();
        }
    }),

    getWinner: (teamScores, matchScore) => new Promise((resolve, reject) => {
        const tournamentId = Cache.get(APP, TOURNAMENT)
        var request = new XMLHttpRequest();
        // http://localhost:8765/winner?tournamentId=41&teamScores[]=1&teamScores[]=2&matchScore=3
        request.open('GET', `/winner?tournamentId=${tournamentId}&teamScores=${teamScores.join(',')}&matchScore=${matchScore}`, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                const { score } = JSON.parse(request.responseText);
                resolve(score);
            } else {
                reject(JSON.parse(request.responseText));
            }
        };

        request.onerror = function() {
            reject({ message:'Connection Error', error: true });
        };

        request.send();
    }),
}