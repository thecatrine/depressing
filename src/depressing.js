import { DepressingPerson } from './person'
import * as data from './depressing_data'
import { commas, setUiState } from './utils'

import * as Velocity from './velocity.min.js'

var h = maquette.h;

var projector = maquette.createProjector();

class GameState {
  constructor() {
    this.calmMode = true;
  }
}

const validGameStates = {
  'intro': 0,
  'first_life': 1,
  'first_person_dead': 2,
  'more_people_setup': 3,
  'more_people': 4,
  'grid_of_people_setup': 5,
  'grid_of_people': 6,
}

const validPurchases = {
  'lifeCoach': {
    title: "Hire a life coach",
    id: 0,
    cost: 10000000,
  },
  'timeflies1': {
    title: "Time flies...",
    id: 1,
    cost: 20000000,
  },
  'timeflies2': {
    title: "...when you're having fun",
    id: 2,
    cost: 100000000,
  },
  'moneyIsntEverything': {
    title: "Money isn't Everything",
    id: 3,
    cost: 10000000000
  },
  'lookAtTheBiggerPicture': {
    title: "Look at the bigger picture",
    id: 4,
    cost: 30000000,
  }
}

var currentPurchases = [
  validPurchases['lifeCoach'],
  validPurchases['moneyIsntEverything'],
  validPurchases['lookAtTheBiggerPicture']
]

class DepressingGame {
  constructor() {
    this.currentTime = (new Date()).getTime();
    this.lastTime = this.currentTime;
    this.globalTimer = 0;

    this.gameState = validGameStates.intro;
    this.people = [new DepressingPerson(this.hidingLogs)];
    this.needsAdvanceYear = 0;
    this.needsStageAdvance = false;

    // For storing things the user enters.
    this.uiState = {
      player_gender: 0,
      player_name: '',
      invest: 0,
      debt: 0
    };

    this.gameData = {
      autoClick: {
        enabled: false,
        timer: 0,
        limit: 1,
      },
    }

    this.totalMoney = 0;
    this.deadPeople = [];
    this.hidingLogs = false;

    var projector = maquette.createProjector();
  }

  purchaseWithMoney(purchase) {
    if (this.totalMoney >= purchase.cost) {
      currentPurchases = currentPurchases.filter(x => x != purchase);
      this.totalMoney -= purchase.cost;
      if (purchase == validPurchases.lifeCoach) {
        this.gameData.autoClick.enabled = true;
        currentPurchases.push(validPurchases.timeflies1);
        currentPurchases.push(validPurchases.timeflies2);
      }
      if (purchase == validPurchases.timeflies1) {
        this.gameData.autoClick.limit /= 4;
        currentPurchases.push(validPurchases.lookAtTheBiggerPicture);
      }
      if (purchase == validPurchases.timeflies2) {
        this.gameData.autoClick.limit /= 10;
      }
      if (purchase == validPurchases.lookAtTheBiggerPicture) {
        this.gameState = validGameStates.grid_of_people_setup;
        this.needsStageAdvance = true;
      }
      if (purchase == validPurchases.moneyIsntEverything) {
        console.log("Money isn't everything!");
      }
    }
  }

  startButton() {
    this.gameState = validGameStates.first_life;
    this.people[0] = new DepressingPerson(this.hidingLogs)
    this.people[0].sex = this.uiState.player_gender > 0.5 ? 'female' : 'male';
    this.people[0].name = this.uiState.player_name;
    this.people[0].isPlayer = true
    this.people[0].record("You start your life.");
  }

  liveButton() {
    this.needsAdvanceYear += 1;
  }

  renderIntroUI() {
    return h('div.intro_ui', [
      h('div.intro_field',[
        h('label', ["Please enter your name"]),
        h('div.control', [
          h('input.text', {
            type: 'text',
            oninput:  setUiState(this.uiState, 'player_name')
          })
        ]),
      ]),
      h('div.intro_field', [
        h('label', ["and gender"]),
        h('div.control', [
          h('input.slider', {
            type: 'range',
            min: 0,
            max: 1,
            step: 0.01,
            value: this.uiState.player_gender,
            oninput:  setUiState(this.uiState, 'player_gender'),
          })
        ]),
        h('label', [this.uiState.player_gender > 0.5 ? "F ": "M "]),
      ]),
      h('button.startButton', {onclick: () => this.startButton()}, ['Start the game'])
    ]);
  }

  renderFirstLifeUI() {
    return h('div#ui', [
      h('div.field',[
        h('label', [`Invest $${commas(this.uiState.invest)}`]),
        h('div.control', [
          h('input.slider', {
            type: 'range',
            min: 0,
            max: this.people[0].cash,
            step: 1,
            value: this.uiState.invest,
            oninput:  setUiState(this.uiState, 'invest')
          })
        ]),
      ]),
      h('div.field',[
        h('label', [`Pay debt $${commas(this.uiState.debt)}`]),
        h('div.control', [
        h('input.slider', {
            type: 'range',
            min: 0,
            max: Math.min(this.people[0].cash - this.uiState.invest, this.people[0].debt),
            step: 1,
            value: this.uiState.debt,
            oninput:  setUiState(this.uiState, 'debt')
          })
        ]),
      ]),
      h('button.liveButton', {onclick: () => this.liveButton()}, ['Play the game'])
    ]);
  }

  renderShop() {
    return h('div#shop', [
      currentPurchases.map( x => h('div', {key: x.id}, [
        h('label', [`$${commas(x.cost)}`]),
        h('button.buy', {
          onclick: () => this.purchaseWithMoney(x),
          disabled: this.totalMoney < x.cost,
        }, [x.title])
      ]))
    ])
  }

  renderGameUI() {
    if (this.people[0]) {
      this.uiState.debt = Math.min(this.people[0].cash, this.people[0].debt);
      this.uiState.invest = Math.max(0, this.people[0].cash - this.uiState.debt);
    }
    return h('div#ui', [
      h('div#fake_controls', [
        h('div.field', [
          h('label', [`Invest $${commas(this.uiState.invest)}`]),
          h('div.control', [
            h('input.slider', {
              type: 'range',
              min: 0,
              max: this.people[0].cash,
              step: 1,
              value: this.uiState.invest,
            })
          ]),
        ]),
        h('div.field', [
          h('label', [`Pay debt $${commas(this.uiState.debt)}`]),
          h('div.control', [
          h('input.slider', {
              type: 'range',
              min: 0,
              max: Math.min(this.people[0].cash - this.uiState.invest, this.people[0].debt),
              step: 1,
              value: this.uiState.debt,
            })
          ]),
        ]),
      ]),
      h('button.liveButton', {onclick: () => this.liveButton()}, ['Play the game']),
      h('div.totalCash', [
        h('label#total_money', [`Total Money: $${commas(this.totalMoney)}`]),
      ]),
      this.renderShop(),
    ]);
  }

  render() {
    if (this.gameState == validGameStates.intro) {
      return h('div#depressing-game', [
        this.renderIntroUI()
      ]);
    } else if (this.gameState == validGameStates.first_life) {
      return h('div#depressing-game', [
        this.people[0].render(),
        this.renderFirstLifeUI()
      ]);
    } else if (this.gameState == validGameStates.first_person_dead || this.gameState == validGameStates.more_people_setup) {
      return h('div#depressing-game', [
        this.people[0].render(),
      ]);
    } else if (this.gameState == validGameStates.more_people || this.gameState == validGameStates.grid_of_people_setup) {
      return h('div#depressing-game', [
        h('div#people', [
          this.people[0].render(),
          this.deadPeople.map((x) => x.render()),
        ]),
        this.renderGameUI()
      ]);
    } else if (this.gameState == validGameStates.grid_of_people) {
      return h('div#depressing-game', [
        h('div#people', [
          this.people.map((per) => per.render({small: true})),
        ]),
        this.renderGameUI(),
      ]);
    }
  }

  updateSalary(p) {
    let raisePercent = 1 + Math.random() * 0.16 - 0.04
    p.salary = Math.round(p.salary * raisePercent)
    if (raisePercent > 1.09) {
      p.record(`Received a large raise to: $${commas(p.salary)}`);
    } else if (raisePercent < 1) {
      p.record(`${p.words().address} ${p.words().pasttobe} fired and got a new job at a lower salary: $${commas(p.salary)}`)
    }
  }

  updateCash(p) {
    // Do earnings
    p.cash += p.salary;
    if (p.expenses > p.cash) {
      var shortfall = p.expenses - p.cash;

      var new_debt = shortfall - p.invested;
      if (shortfall > p.invested) {
        p.logs.record(p.age, `${p.words().address} had to go into debt - $${commas(new_debt)}. Savings wiped out.`);
        p.invested = 0;
      } else {
        p.logs.record(p.age, `${p.words().address} had to go into debt - $${commas(new_debt)}.`);
      }
      p.debt += shortfall;
    } else {
      p.cash -= p.expenses;
    }
  }

  updatePerson(p, invest, debt) {
      p.age += 1;

      this.updateSalary(p);
      this.updateCash(p);
      // Do debt and interest
      if (invest > 0) {
        p.cash -= invest;
        p.invested += invest;
      }

      if (debt > 0) {
        p.cash -= debt;
        p.debt -= debt;
      }
      // Do interest
      p.debt = Math.round(p.debt*1.04);

      p.expenses = Math.round(p.expenses * (1 + data.VERY_DEPRESSING_DATA.inflation));
      // Do age and death
      var age = Math.min(119, p.age);
      var deathRate = data.VERY_DEPRESSING_DATA.death_rates[age][p.sex];
      if (Math.random() < deathRate) {
        p.dead = true;
        p.logs.record(p.age, `${p.words().address} died.`);
      }
  }

  advanceYearIfNeeded() {
    while (this.needsAdvanceYear > 0) {
      // Advance time a year and have events happen.
      this.people.map((p) =>
        this.updatePerson(
          p,
          parseInt(this.uiState.invest),
          parseInt(this.uiState.debt)
        ));
      if (this.people[0]) {
        this.updatePerson(
          this.people[0],
          parseInt(this.uiState.invest),
          parseInt(this.uiState.debt)
        )
      }
      this.uiState.invest = 0;
      this.uiState.debt = 0;
      this.needsAdvanceYear -= 1;
    }
  }

  doAutoclickTimer(delta) {
    if (this.gameData.autoClick.enabled) {
      this.gameData.autoClick.timer += delta;
      if (this.gameData.autoClick.timer > this.gameData.autoClick.limit) {
        this.needsAdvanceYear += 1;
        this.gameData.autoClick.timer = 0;
      }
    }
  }

  update(delta) {
    if (this.gameState < validGameStates.first_person_dead) {
      this.advanceYearIfNeeded()
      if (this.people[0].dead) {
        this.gameState = validGameStates.first_person_dead;
        this.needsStageAdvance = true;
      }
    } else if (this.gameState == validGameStates.first_person_dead) {
      if (this.needsStageAdvance) {
        this.needsStageAdvance = false;
        this.dramaticTimer = 0;
      }
      // We have a dramatic pause here for 10s
      if (this.dramaticTimer < 10) {
        this.dramaticTimer += delta;
      } else {
        this.needsStageAdvance = true;
        this.gameState = validGameStates.more_people_setup;
        Velocity(document.getElementById("depressing-game"), {
          opacity: 0,
        }, {
          duration: 2000,
        });
      }
    } else if (this.gameState == validGameStates.more_people_setup) {
      if (this.needsStageAdvance) {
        this.needsStageAdvance = false;
        this.dramaticTimer = 0;
      }
      if (this.dramaticTimer < 3) {
        this.dramaticTimer += delta;
      } else {
        this.people[0] = new DepressingPerson(this.hidingLogs)
        Velocity(document.getElementById("depressing-game"), {
          opacity: 1,
        }, {
          duration: 2000,
        });
        this.needsStageAdvance = true;
        this.gameState = validGameStates.more_people;
      }
    } else if (this.gameState == validGameStates.more_people) {
      if (this.needsStageAdvance) {
        this.needsStageAdvance = false;
        this.autoTimer = 0;
      }
      this.advanceYearIfNeeded()
      if (this.people[0].dead) {
        this.totalMoney += this.people[0].invested;
        this.deadPeople.unshift(this.people[0]);
        this.showingHiddenThings = true;
        // After they kill one more person, hide fake controls and show money
        Velocity(document.getElementById("total_money"), {
          opacity: 1,
        }, {
          duration: 2000,
        });
        Velocity(document.getElementById("fake_controls"), {
          opacity: 0,
        }, {
          duration: 2000,
        });
        // After they've killed 3 people, stop showing logs, we don't care about those people.
        if (this.deadPeople.length == 2) {
          this.hidingLogs = true;
          Velocity(document.getElementById("shop"), {
            opacity: 1,
            display: 'inline',
          }, {
            duration: 2000,
          });
        }

        this.people[0] = new DepressingPerson(this.hidingLogs);
      }
      this.doAutoclickTimer(delta);
    } else if (this.gameState == validGameStates.grid_of_people_setup) {
      if (this.needsStageAdvance) {
        this.dramaticTimer = 0;
        this.needsStageAdvance = false;
        Velocity(document.getElementById("depressing-game"), {
          opacity: 0,
        }, {
          duration: 2000,
        });
      }
      this.dramaticTimer += delta;
      if (this.dramaticTimer > 2) {
        this.needsStageAdvance = true;
        this.gameState = validGameStates.grid_of_people;
      }
    } else if (this.gameState == validGameStates.grid_of_people) {
      if (this.needsStageAdvance) {
        Velocity(document.getElementById("depressing-game"), {
          opacity: 1,
        }, {
          duration: 2000,
        });
        this.needsStageAdvance = false;
        this.people = [this.people[0], new DepressingPerson()];
        this.deadPeople = null;
      }

      this.doAutoclickTimer(delta);
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
