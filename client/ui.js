const ui = {
    displayWinner: (winner) => {
        document.getElementById("winner").innerHTML = winner
        document.getElementById("progress").innerHTML = ""
        ui.showShade()
    },

    displayRound: (round) => {
        const h2 = document.createElement("h2")
        h2.setAttribute("id", `round_${round}`)
        h2.className = "results_round"
        h2.textContent = `Round ${(round + 1)}`
        document.getElementById("results").appendChild(h2)
    },

    displayMatch: ({ winner, losers }) => {
        const p = document.createElement("p")
        p.className = "results_match"
        p.innerHTML = `${winner.name} <i>defeated</i> ${losers.map(team => team.name).join(", ")}`
        document.getElementById("results").appendChild(p)
    },

    displayProgress: ({ completed, pending }) => {
        document.getElementById("progress").innerHTML = Array(completed).fill('☒').concat( Array(pending).fill('☐') ).join('')
    },

    clearResults: () => {
        document.getElementById("winner").innerHTML = ""
        document.getElementById("progress").innerHTML = ""
        document.getElementById("results").innerHTML = ""
        document.getElementById("shade").className = ""
        ui.hideShade()
    },

    showShade: () => {
        document.getElementById("shade").className = "visible"
    },

    hideShade: () => {
        document.getElementById("shade").className = ""
    }
}
