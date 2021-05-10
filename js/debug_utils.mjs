
export function log(id, value) {
  let line = '';
  if (value instanceof Array) {
    for (let i in value) {
      if (line != '') {
        line += ',  ';
      }
      line += new Intl.NumberFormat('en-IN', {maximumFractionDigits: 3}).format(value[i]);
    }
    line = '[' + line + ']';
  } else {
     line = value;
  }
  document.getElementById(id).innerText = line;
}

var statsValues = {};

export function addStats(name, value) {
  let values = statsValues[name];
  if (values == null) {
    values = [];
    statsValues[name] = values;
  }
  values.push(value);
  let avg = calcAvg(values);
  log(name, avg + '±' + calcMQD(values, avg));
}

function calcAvg(values) {
  var sum = 0;
  values.forEach(value => {sum += value;});
  return sum / values.length;
}

function calcMQD(values, avg) {
  var sum = 0;
  values.forEach(value => {
    let diff = value - avg
    sum += diff * diff;
  });
  return Math.sqrt(sum / values.length);
}
