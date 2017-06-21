const ui = {
    elements: {},

    el: (id) => {
        if (ui.elements[id]) return ui.elements[id]
        return ui.elements[id] = document.getElementById(id)
    },

    displayWinner: (winner) => {
        ui.el("winner").innerHTML = winner
        ui.el("progress").innerHTML = ""
        ui.showShade()
    },

    displayRound: (round) => {
        if (!ui.el("results")) return
        const h2 = document.createElement("h2")
        h2.setAttribute("id", `round_${round}`)
        h2.className = "results_round"
        h2.textContent = `Round ${(round + 1)}`
        ui.el("results").appendChild(h2)
    },

    displayMatch: ({ winner, losers }) => {
        if (!ui.el("results")) return
        const p = document.createElement("p")
        p.className = "results_match"
        p.innerHTML = `${winner.name} <i>defeated</i> ${losers.map(team => team.name).join(", ")}`
        ui.el("results").appendChild(p)
    },

    displayProgress: ({ completed, pending }) => {
        ui.el("progress").innerHTML = Array(completed).fill('☒').concat( Array(pending).fill('☐') ).join('')
    },

    displayError: (error) => {
        ui.el("error").innerHTML = error
        ui.showShade()
    },

    clear: () => {
        ["winner", "error", "progress"].map(id => ui.el(id).innerHTML = "")
        if (ui.el("results")) ui.el("results").innerHTML = ""
        ui.hideShade()
    },

    showShade: () => {
        ui.el("shade").className = "visible"
    },

    hideShade: () => {
        ui.el("shade").className = ""
    }
}
