// Edit me.
// Feel free to add other JS files in this directory as you see fit.

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("shade").addEventListener("click", (event) => {
        ui.hideShade()
    })

    document.getElementById("start").addEventListener("click", () => {
        ui.clearResults()

        const teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
        const numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)

        App.getTournament({ teamsPerMatch, numberOfTeams })
        .then(round => App.runRound({ round }))
        .catch(error => alert(error.message))
    })

    App.init(ui)
});
