export function commas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function setUiState(state, value) {
  return function(ev) {
    state[value] = ev.target.value;
  }
}
