const ui = {
    E: {},

    el: (id) => (ui.E[id]) ? ui.E[id] : ui.E[id] = document.getElementById(id),

    displayWinner: (winner) => {
        ui.el("winner").innerHTML = winner
    },

    displayRound: (round) => console.log(`Round ${(round + 1)}`),

    displayMatch: ({ winner, losers }) => console.log(`${winner.name} defeated ${losers.map(team => team.name).join(", ")}`),

    initProgress: ({ totalMatches }) => {
        ui.totalMatches = totalMatches
        ui.completedMatches = 0
        ui.el("progress").innerHTML = Array(ui.totalMatches).fill('<span></span>').join('')
    },

    updateProgress: () => ui.el("progress").querySelector(`span:nth-child(n+${++ui.completedMatches})`).className='completed',

    displayError: (error) => ui.el("error").innerHTML = error,

    clear: () => ["winner", "error", "progress"].map(id => ui.el(id).innerHTML = "")
}
