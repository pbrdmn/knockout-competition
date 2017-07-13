class UI {
    constructor(params) {
        const defaults = { progressId: "progress", errorId: "error", winnerId: "winner", startId: "start", pauseId: "pause" }
        const options = Object.assign({}, defaults, params)
        this.progress = document.getElementById(options.progressId)
        this.winner = document.getElementById(options.winnerId)
        this.error = document.getElementById(options.errorId)
        this.start = document.getElementById(options.startId)
        this.pause = document.getElementById(options.pauseId)
    }

    initProgress(matches) {
        this.start.setAttribute('disabled', 'disabled')
        app.ui.start.innerText = "Running"
        this.clear()
        // Create boxes for each match to be completed
        this.progress.innerHTML = Array(matches).fill('<span></span>').join('')
    }

    updateProgress({ id, completed, text }) {
        // A match has been completed, mark a box
        const box = this.progress.querySelector(`span:nth-child(n+${id})`)
        if (completed) box.className = 'completed'
        box.setAttribute('title', text)
    }

    displayWinner(winner) {
        this.start.removeAttribute('disabled')
        app.ui.start.innerText = "Start"
        this.winner.innerHTML = winner
    }

    displayError(error) {
        this.error.innerHTML = error
    }

    displayPause(paused) {
        this.pause.innerHTML = paused ? "Resume" : "Pause"
    }

    clear() {
        [this.winner, this.error, this.progress].map(el => el.innerHTML = "")
    }
}
