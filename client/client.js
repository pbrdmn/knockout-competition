// Edit me.
// Feel free to add other JS files in this directory as you see fit.

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("start").addEventListener("click", (event) => {
        const teamsPerMatch = Number.parseInt(document.getElementById("teamsPerMatch").value, 10)
        const numberOfTeams = Number.parseInt(document.getElementById("numberOfTeams").value, 10)
        console.log('start', { teamsPerMatch, numberOfTeams })

        var request = new XMLHttpRequest();
        request.open('POST', '/tournament', true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const data = JSON.parse(request.responseText);
            } else {
                // We reached our target server, but it returned an error
                console.error(JSON.parse(request.responseText));
            }
        };

        request.onerror = function() {
            // There was a connection error of some sort
            console.error('Connection Error')
        };

        request.send(`teamsPerMatch=${teamsPerMatch}&numberOfTeams=${numberOfTeams}`);
    })

    document.getElementById("winner").innerHTML = 'Ready'
});