// Edit me.
// Feel free to add other JS files in this directory as you see fit.

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById('shade').addEventListener("click", (event) => {
        event.target.className = ""
    })
    document.getElementById("start").addEventListener("click", () => {
        document.getElementById('winner').innerHTML = ''
        document.getElementById('results').innerHTML = ''
        document.getElementById('shade').className = ""

        const teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
        const numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)

        Cache.set(APP, 'teamsPerMatch', teamsPerMatch);
        Cache.set(APP, 'numberOfTeams', numberOfTeams);

        App.getTournament({ teamsPerMatch, numberOfTeams })
        .then(round => App.runRound({ round }))
        .catch(error => alert(error.message))
    })
});
