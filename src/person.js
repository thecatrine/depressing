import * as data from './depressing_data'
import { commas } from './utils'

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

  record(message) {
    this.logs.record(this.age, message);
  }

  render() {
    return h('div.person', [
      h('div.name', [this.name]),
      h('div.sex', [this.sex]),
      h('div.age', ["Age: " + this.age.toString()]),
      h('div.salary', ["Salary: $" + commas(this.salary)]),
      h('div.expenses', ["Expenses: -$" + commas(this.expenses)]),
      h('div.cash', ["Cash: $" + commas(this.cash)]),
      h('div.investments', ["Invested: $" + commas(this.invested)]),
      h('div.debt', ["Debt: -$" + commas(this.debt)]),
      this.logs.render()
    ]);
  }
}
