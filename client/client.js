// Edit me.
// Feel free to add other JS files in this directory as you see fit.

// When the webpage has loaded
document.addEventListener("DOMContentLoaded", (event) => {
    
    app = new App({
        // decouple the UI from the business login
        ui: new UI(),
        // decouple the networking from the business login
        http: new HTTP({
            // rateLimit: 5 // max requests per second
            connectionsLimit: 4 // max simultaneous connections
        }),
        // debug: true // Enable debug logging
    })

    // Handle clicking on the "Start" button
    document.getElementById("start").addEventListener("click", () => {
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
