const ui = {
    elements: {},

    el: (id) => {
        if (ui.elements[id]) return ui.elements[id]
        return ui.elements[id] = document.getElementById(id)
    },

    displayWinner: (winner) => {
        ui.el("winner").innerHTML = winner
        ui.el("winner").className = "visible"
        ui.el("progress").innerHTML = ""
    },

    displayRound: (round) => {
        const message = `Round ${(round + 1)}`
        if (!ui.el("results")) return console.log(message)
        const h2 = document.createElement("h2")
        h2.setAttribute("id", `round_${round}`)
        h2.className = "results_round"
        h2.textContent = message
        ui.el("results").appendChild(h2)
    },

    displayMatch: ({ winner, losers }) => {
        const message = `${winner.name} <i>defeated</i> ${losers.map(team => team.name).join(", ")}`
        if (!ui.el("results")) return console.log(message)
        const p = document.createElement("p")
        p.className = "results_match"
        p.innerHTML = message
        ui.el("results").appendChild(p)
    },

    displayProgress: ({ completed, pending }) => {
        ui.el("progress").innerHTML = Array(completed).fill('☒').concat( Array(pending).fill('☐') ).join('')
    },

    displayError: (error) => {
        ui.el("error").innerHTML = error
        ui.el("error").className = "visible"
    },

    clear: () => {
        ["winner", "error", "progress"].map(id => {ui.el(id).innerHTML = ""; ui.el(id).className = ""})
        if (ui.el("results")) ui.el("results").innerHTML = ""
    }
}
