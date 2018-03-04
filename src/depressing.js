import { DepressingPerson } from './person'
import * as data from './depressing_data'
import { commas } from './utils'

var h = maquette.h;

var projector = maquette.createProjector();

class GameState {
  constructor() {
    this.calmMode = true;
  }
}

class DepressingGame {
  constructor() {
    this.currentTime = (new Date()).getTime();
    this.lastTime = this.currentTime;
    this.globalTimer = 0;
    this.person = new DepressingPerson();

    this.needsAdvanceYear = false;

    var projector = maquette.createProjector();
  }

  liveButton() {
    this.needsAdvanceYear = true;
  }

  render() {
    return h('div.depressing-game', [
      this.person.render(),
      h('button.liveButton', {onclick: () => this.liveButton()}, ['Play the game'])
    ]);
  }

  updatePerson(p) {
      p.age += 1;

      // Do earnings
      p.cash += p.salary;
      if (p.expenses > p.cash) {
        var shortfall = p.expenses - p.cash;

        var new_debt = shortfall - p.invested;
        if (shortfall > p.invested) {
          p.logs.record(p.age, `Had to go into debt - $${commas(new_debt)}. Savings wiped out.`);
          p.invested = 0;
        } else {
          p.logs.record(p.age, `Had to go into debt - $${commas(new_debt)}.`);
        }
        p.debt -= shortfall;
      } else {
        p.cash -= p.expenses;
      }
      // Do debt and interest
      // Do age and death
      var age = Math.min(119, p.age);
      var deathRate = data.VERY_DEPRESSING_DATA.death_rates[age][p.sex];
      if (Math.random() < deathRate) {
        p.dead = true;
        p.logs.record(p.age, "You died.");
      }
  }

  update(delta) {
    if (this.needsAdvanceYear) {
      // Advance time a year and have events happen.
      this.updatePerson(this.person);

      this.needsAdvanceYear = false;
    }
  }

  gameloop() {
    // Setup
    window.requestAnimationFrame(() => {this.gameloop()});
    this.currentTime = (new Date()).getTime();
    var delta = (this.currentTime-this.lastTime) / 1000;
    // Game logic
    this.update(delta);
    // Cleanup
    this.lastTime = this.currentTime;
    projector.scheduleRender();
  }
}

var depressingGame = new DepressingGame();

function render() {
    return h('div.meta-depressing-game', [depressingGame.render()]);
}

document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, render);
  depressingGame.gameloop();
})
