
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
