// Edit me.
// Feel free to add other JS files in this directory as you see fit.

document.addEventListener("DOMContentLoaded", (event) => {
    App.init();
});

const App = {
    getWinner: () => {},

    getWinners: () => {
        console.log("Loading Winners")
    },

    getMatch: (match) => {
        var request = new XMLHttpRequest();
        request.open('GET', `/match?tournamentId=${App.tournamentId}&round=${App.round}&match=${match.match}`, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const { score } = JSON.parse(request.responseText);
                match.score = score;
                App.loadedMatches++;

                // console.log(`Loaded ${App.loadedMatches} of ${App.matchUps.length} matches`, match)
                console.log(`Loading Matches:  ${App.loadedMatches} of ${App.matchUps.length}`)
                if (App.loadedMatches === App.matchUps.length) {
                    console.log("")
                    App.getWinners()
                }
            } else {
                // We reached our target server, but it returned an error
                console.error(JSON.parse(request.responseText).message);
            }
        };

        request.onerror = function() {
            // There was a connection error of some sort
            console.error('Connection Error')
        };

        request.send();
    },

    getMatches: () => {
        console.log("Loading Matches")
        App.loadedMatches = 0;
        App.matchUps.map((match) => {
            App.getMatch(match)
        })
    },

    getTeam: (teamId) => {
        var request = new XMLHttpRequest();
        request.open('GET', `/team?tournamentId=${App.tournamentId}&teamId=${teamId}`, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const team = JSON.parse(request.responseText);
                App.teams[team.teamId] = team;
                App.loadedTeams++;


                console.log(`Loading Teams:  ${App.loadedTeams} of ${App.numberOfTeams}`)
                if (App.loadedTeams === App.numberOfTeams) {
                    console.log("")
                    App.getMatches()
                }
            } else {
                // We reached our target server, but it returned an error
                console.error(JSON.parse(request.responseText).message);
            }
        };

        request.onerror = function() {
            // There was a connection error of some sort
            console.error('Connection Error')
        };

        request.send();
    },

    getTeams: () => {
        console.log("Loading Teams")
        App.teams = [];
        App.loadedTeams = 0;
        for (let i = 0; i < App.numberOfTeams; i++) {
            App.getTeam(i);
        }
    },

    init: () => {
        document.getElementById("start").addEventListener("click", (event) => {
            App.teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
            App.numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)
            console.log("Creating Tournament")

            var request = new XMLHttpRequest();
            request.open('POST', '/tournament', true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    const tournament = JSON.parse(request.responseText);
                    App.tournamentId = tournament.tournamentId;
                    App.round = 0;
                    App.matchUps = tournament.matchUps;
                    App.getTeams();
                } else {
                    // We reached our target server, but it returned an error
                    const response = JSON.parse(request.responseText)
                    if (response.error) {
                        alert(response.message)
                    }
                }
            };

            request.onerror = function() {
                // There was a connection error of some sort
                console.error('Connection Error')
            };

            request.send(`teamsPerMatch=${App.teamsPerMatch}&numberOfTeams=${App.numberOfTeams}`);
        })
    }
}