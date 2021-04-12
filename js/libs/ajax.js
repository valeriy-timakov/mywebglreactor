/**
 * Created by valti on 02.04.2021.
 */

export const Ajax = {

  get: function(url) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(xhr);
          }
        }
      };
      xhr.onerror = reject;
      xhr.send(null);
    });
  }


}
