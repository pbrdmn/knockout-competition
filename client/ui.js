class UI {
  constructor(params) {
    const defaults = {
      progressId: "progress",
      errorId: "error",
      winnerId: "winner",
      startId: "start",
    };
    const options = Object.assign({}, defaults, params);
    this.progress = document.getElementById(options.progressId);
    this.winner = document.getElementById(options.winnerId);
    this.error = document.getElementById(options.errorId);
    this.start = document.getElementById(options.startId);
  }

  initProgress(matches) {
    this.start.setAttribute("disabled", "disabled");
    app.ui.start.innerText = "Running";
    this.clear();
    this.done = 0;
    // Create boxes for each match to be completed
    this.progress.innerHTML = Array(matches).fill("<span></span>").join("");
  }

  updateProgress() {
    // A match has been completed, mark a box
    this.progress.querySelector(`span:nth-child(n+${++this.done})`).className =
      "completed";
  }

  displayWinner(winner) {
    this.start.removeAttribute("disabled");
    app.ui.start.innerText = "Start";
    this.winner.innerHTML = winner;
  }

  displayError(error) {
    this.error.innerHTML = error;
  }

  clear() {
    [this.winner, this.error, this.progress].map((el) => (el.innerHTML = ""));
  }
}
