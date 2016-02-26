function localStorageHelper(clearOnInit) {
  this.keyPrefix = "__ytque_";
  if (clearOnInit) localStorage.clear();
  return this;
}
localStorageHelper.prototype.__getPrefixedKey = function(key) {
  return (this.keyPrefix + key);
}

localStorageHelper.prototype.get = function(key) {
  key = this.__getPrefixedKey(key);
  var value = localStorage[key];
  var result;

  if (localStorage[key]) {
    try {
      result = JSON.parse(value);
    } catch (e) {
      result = value;
    }
  }
  return result;
};

localStorageHelper.prototype.set = function(key, value) {
  key = this.__getPrefixedKey(key);
  localStorage[key] = JSON.stringify(value);
  return true;
};

localStorageHelper.prototype.remove = function(key) {
  key = this.__getPrefixedKey(key);
  localStorage.removeItem(key) || delete localStorage[key];
  return true;
};
