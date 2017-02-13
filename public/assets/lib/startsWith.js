/* eslint-disable */
/*! https://mths.be/startswith v0.2.0 by @mathias */
if (!String.prototype.startsWith) {
  (function () {
 // needed to support `apply`/`call` with `undefined`/`null`
    const defineProperty = (function () {
			// IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        const object = {};
        const $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch (error) {}
      return result;
    }());
    const toString = {}.toString;
    const startsWith = function (search) {
      if (this == null) {
        throw TypeError();
      }
      const string = String(this);
      if (search && toString.call(search) == '[object RegExp]') {
        throw TypeError();
      }
      const stringLength = string.length;
      const searchString = String(search);
      const searchLength = searchString.length;
      const position = arguments.length > 1 ? arguments[1] : undefined;
			// `ToInteger`
      let pos = position ? Number(position) : 0;
      if (pos != pos) { // better `isNaN`
        pos = 0;
      }
      const start = Math.min(Math.max(pos, 0), stringLength);
			// Avoid the `indexOf` call if no match is possible
      if (searchLength + start > stringLength) {
        return false;
      }
      let index = -1;
      while (++index < searchLength) {
        if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
          return false;
        }
      }
      return true;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'startsWith', {
        value: startsWith,
        configurable: true,
        writable: true,
      });
    } else {
      String.prototype.startsWith = startsWith;
    }
  }());
}
