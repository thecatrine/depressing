import * as data from './depressing_data'

var h = maquette.h;

export class DepressingLog {
  constructor() {
    this._log = []
    this.record(18, "You start your life.");
  }

  record(age, message) {
    this._log.unshift({m: message, id: this._log.length, age: age})
  }

  render() {
    return h('div.log',
      this._log.map(msg =>
        h('p', {key: msg.id}, [
          h('b', [`Age ${msg.age} `]),
          msg.m
        ])
      )
    )
  }
}

export class DepressingPerson {
  constructor() {
    this.sex = Math.random() > 0.5 ? 'male' : 'female'
    this.name = data.random_name(this.sex)
    this.age = 18
    this.cash = 0
    this.salary = 28485
    this.invested = 0
    this.debt = 0
    this.expenses = data.VERY_DEPRESSING_DATA.cost_of_living
    this.utilons = 0
    this.delors = 0
    this.dead = false
    this.logs = new DepressingLog()
  }

  render() {
    return h('div.person', [
      h('div.name', [this.name]),
      h('div.sex', [this.sex]),
      h('div.age', ["Age: " + this.age.toString()]),
      h('div.cash', ["Cash: $" + this.cash.toString()]),
      h('div.investments', ["Invested: $" + this.invested.toString()]),
      h('div.debt', ["Debt: $" + this.debt.toString()]),
      this.logs.render()
    ]);
  }
}
