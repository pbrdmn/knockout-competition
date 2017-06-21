// Edit me.
// Feel free to add other JS files in this directory as you see fit.

// Setup display handling functions to decouple the UI from the business login
const app = new App(ui)

// When the webpage has loaded
document.addEventListener("DOMContentLoaded", (event) => {
    // Handle clicking on the "Start" button
    document.getElementById("start").addEventListener("click", () => {
        // Reset the UI
        ui.clear()

        // Retrieve and parse the input
        const teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
        const numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)

        // Retrieve the tournament and begin running the program
        app.getTournament({ teamsPerMatch, numberOfTeams })
        .then(matchUps => app.runRound({ round: 0, matchUps }))
        // Display errors gracefully
        .catch(error => alert(error.message))
    })
})
