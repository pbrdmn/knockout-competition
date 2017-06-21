const ui = {
    E: {},

    el: (id) => (ui.E[id]) ? ui.E[id] : ui.E[id] = document.getElementById(id),

    displayWinner: (winner) => {
        ui.clear()
        ui.el("winner").innerHTML = winner
    },

    displayRound: (round) => console.log(`Round ${(round + 1)}`),

    displayMatch: ({ winner, losers }) => console.log(`${winner.name} defeated ${losers.map(team => team.name).join(", ")}`),

    displayProgress: ({ completed, pending }) => ui.el("progress").innerHTML = Array(completed).fill('☒').concat( Array(pending).fill('☐') ).join(''),

    displayError: (error) => ui.el("error").innerHTML = error,

    clear: () => ["winner", "error", "progress"].map(id => ui.el(id).innerHTML = "")
}
