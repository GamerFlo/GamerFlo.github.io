/** Initializes game variables */
var points, gain, time
var bestPoints = new Decimal(0)
var prestigeMult = new Decimal(1)
var prestigeMult1 = new Decimal(1)
var autoBuyPurchased = false
var qolPurchased = false
var upgrade = {
  level: new Decimal(0),
  cost() {return new Decimal(10).mul(new Decimal(1.2).pow(this.level))},
  effect() {return new Decimal(1.15).pow(this.level)},
}
var timeSpent = 0
var bestTime = Number.MAX_VALUE

const autoBuyCost = new Decimal('e11')
const qolCost = new Decimal('e8')
/** Developer setting, disables game loading if false */
var loadGame = false




/** Starts the game */
function init() {
  points = new Decimal(0)
  gain = new Decimal(1)
  time = Date.now()
  autoBuyPurchased = false
  qolPurchased = false
  timeSpent = 0
}

/** Saves player progress */
function save() {
  localStorage.setItem('gameSave', JSON.stringify({
    points: points.toString(),
    gain: gain.toString(),
    time,
    upgrade: {
      level: upgrade.level.toString()
    },
    bestPoints: bestPoints.toString(),
    prestigeMult: prestigeMult.toString(),
    prestigeMult1: prestigeMult1.toString(),
    autoBuyPurchased,
    qolPurchased,
    timeSpent,
    bestTime
  }));
}

/** Loads player progress */
function load() {
  if (loadGame) {
    const state = JSON.parse(localStorage.getItem('gameSave'));
    if (state) {
      points = new Decimal(state.points);
      gain = new Decimal(state.gain);
      time = state.time;

      upgrade.level = new Decimal(state.upgrade.level);

      let timeElapsed = (Date.now() - state.time) / 1000;
      let earnings = new Decimal(timeElapsed).mul(gain);
      points = points.add(earnings);

      bestPoints = new Decimal(state.bestPoints);
      prestigeMult = new Decimal(state.prestigeMult);
      prestigeMult1 = new Decimal(state.prestigeMult1);
      autoBuyPurchased = state.autoBuyPurchased || false;
      qolPurchased = state.qolPurchased || false
      timeSpent = state.timeSpent || 0;
      bestTime = state.bestTime || Number.MAX_VALUE;

      // Show offline earnings in the modal
      if (earnings.gt(0)) {
        const modal = document.getElementById('offlineModal');
        const earningsText = document.getElementById('offlineEarningsText');
        earningsText.innerHTML = `Welcome back! You were away for ${format(timeElapsed)} seconds.<br>While you were away, you earned:<br><br>- ${format(earnings)} points.`;
        modal.style.display = 'block';

        // Close the modal when the user clicks the close button
        document.getElementById('closeModal').onclick = () => {
          modal.style.display = 'none';
        };

        // Close the modal when the user clicks outside of it
        window.onclick = (event) => {
          if (event.target === modal) {
            modal.style.display = 'none';
          }
        };
      }

      return;
    }
  }
  init();
}

/** Exports the save data as a JSON file */
function exportSave() {
  const saveData = localStorage.getItem('gameSave');
  const blob = new Blob([saveData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pointIdle_save_${commaFormat(Date.now())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Imports save data from a JSON file */
function importSave(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result);
        localStorage.setItem('gameSave', JSON.stringify(saveData));
        load(); // Reload the game with the imported save
        alert('Save imported successfully!');
      } catch (error) {
        alert('Invalid save file!');
      }
    };
    reader.readAsText(file);
  }
}

/** Resets the game progress */
function resetProgress() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
    localStorage.removeItem('gameSave');
    init(); // Reinitialize the game
    alert('Progress has been reset.');
  }
}




/** Game loop, runs every 16.66... ms */
function loop(diff=(Date.now()-time)/1000) {
  gain = upgrade.effect().mul(prestigeMult).mul(prestigeMult1)
  points = points.add(gain.mul(diff))

  if (autoBuyPurchased) {
    while (points.gte(upgrade.cost())) {
      upgrade.level = upgrade.level.add(1);
      if (!qolPurchased) points = points.sub(upgrade.cost());
    }
  }

  if (document.getElementById('autoPrestige').checked && points.gte(1e6)) {
    prestige()
  }

  timeSpent += diff
  updateUI()
  time = Date.now()
}

/** Updates the game's UI */
function updateUI() {
  // Displays the player's points
  const eP = document.getElementById('points')
  eP.innerHTML = `Points: ${format(points)}.`

  // Displays point gain
  const eG = document.getElementById('gain')
  eG.innerHTML = `Current gain: ${format(gain)}/s.<br>Time spent this run: ${format(timeSpent)}s.`

  // Displays the upgrade button
  const eUpg = document.getElementById('upgrade')
  eUpg.innerHTML = `Upgrade (Level ${format(upgrade.level, 0)})<br>Cost: ${format(upgrade.cost())} points<br>Effect: ${format(upgrade.effect())}x`
  if (points.lt(upgrade.cost())) eUpg.classList.add('locked')
  else eUpg.classList.remove('locked')

  // Displays the progress bar
  const eBar = document.getElementById('resetBar')
  let progress = points.log10().div(6).mul(100).min(100)
  eBar.style.width = `${progress}%`
  eBar.innerHTML = `Goal: 1,000,000 points<br>(${format(progress)}%)`

  // Displays the prestige button
  const ePrestige = document.getElementById('prestige');
  ePrestige.innerHTML = `Prestige<br>Best points: ${format(bestPoints)} - Effect: ${format(prestigeMult)}x<br>Best time: ${format(bestTime)}s - Effect: ${format(prestigeMult1)}x`;
  if (points.gte(1e6)) ePrestige.classList.remove('locked');
  else ePrestige.classList.add('locked');

  // Displays the auto-buy button
  const eAutoBuy = document.getElementById('autoBuy');
  eAutoBuy.innerHTML = `Automatically buy upgrades.<br>Cost: ${format(autoBuyCost)} points`;
  if (autoBuyPurchased) {
    eAutoBuy.classList.add('bought');
    eAutoBuy.innerHTML = 'Automatically buy upgrades.<br>Already purchased.';
  } else if (points.lt(autoBuyCost)) {
    eAutoBuy.classList.add('locked');
  } else {
    eAutoBuy.classList.remove('locked');
  }

  // Displays the QoL upgrade
  const eQoL = document.getElementById('qol1')
  eQoL.innerHTML = `Upgrades no longer cost points.<br>Cost: ${format(qolCost)} points`
  if (qolPurchased) {
    eQoL.classList.add('bought');
    eQoL.innerHTML = 'Upgrades no longer cost points.<br>Already purchased.';
  } else if (points.lt(qolCost)) {
    eQoL.classList.add('locked');
  } else {
    eQoL.classList.remove('locked');
  }
}


/** Buys upgrades based on the index */
function buy(i) {
  // First upgrade
  if (i==0) {
    // This is intended. It buys the maximum amount and pays ONLY for the last level.
    while (points.gte(upgrade.cost())) {
      if (points.gte(upgrade.cost())) {upgrade.level = upgrade.level.add(1)}
    }
    if (!qolPurchased) points = points.sub(upgrade.cost().div(1.15))
  }
  // Automation upgrade
  if (i==1) {
    if (!autoBuyPurchased && points.gte(autoBuyCost)) {
      points = points.sub(autoBuyCost)
      autoBuyPurchased = true
      alert('Feature purchased! Upgrades will now be bought automatically.');
    }
  }
  // QoL upgrade
  if (i==2) {
    if (!qolPurchased && points.gte(qolCost)) {
      points = points.sub(qolCost)
      qolPurchased = true
      alert('Feature purchased! Upgrades will no longer cost points.');
    }
  }
}

let buyingInterval;

function startBuying() {
  if (!buyingInterval) {
    buyingInterval = setInterval(() => buy(0), 1000/60);
  }
}

function stopBuying() {
  clearInterval(buyingInterval);
  buyingInterval = null;
}

/** Handles prestige */
function prestige() {
  if (points.gte(1e6)) { // Prestige is available after reaching 1,000,000 points
    // Update best points
    if (points.gt(bestPoints)) {
      bestPoints = points
    }
    if (timeSpent < bestTime) {
      bestTime = timeSpent
    }

    // Reset the game
    points = new Decimal(0)
    gain = new Decimal(1)
    upgrade.level = new Decimal(0)
    timeSpent = 0
    prestigeMult = bestPoints.log10().sub(5).pow(1.5) // Logarithmic multiplier scaling
    if (bestTime > 7200) prestigeMult1 = new Decimal(1)
    else if (bestTime > 10) prestigeMult1 = new Decimal(7200).div(bestTime).log().div(new Decimal(2).log())
    else prestigeMult1 = new Decimal(7200).div(bestTime).log().div(new Decimal(2).log()).pow(2)
  }
}




window.onload = load
window.onbeforeunload = save
setInterval(loop, 1000/60)