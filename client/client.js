// Edit me.
// Feel free to add other JS files in this directory as you see fit.

document.addEventListener("DOMContentLoaded", (event) => {
    App.init();
});

const App = {
    teams: [],

    getTeam: (teamId) => {
        var request = new XMLHttpRequest();
        request.open('GET', `/team?tournamentId=${App.tournamentId}&teamId=${teamId}`, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const team = JSON.parse(request.responseText);
                App.teams[team.teamId] = team;
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
        for (let i = 0; i < App.numberOfTeams; i++) {
            App.getTeam(i);
        }
    },

    init: () => {
        document.getElementById("start").addEventListener("click", (event) => {
            App.teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
            App.numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)

            var request = new XMLHttpRequest();
            request.open('POST', '/tournament', true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    const tournament = JSON.parse(request.responseText);
                    App.tournamentId = tournament.tournamentId;
                    App.matchUps = tournament.matchUps;
                    App.getTeams();
                } else {
                    // We reached our target server, but it returned an error
                    console.error(JSON.parse(request.responseText).message);
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