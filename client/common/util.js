/* eslint import/prefer-default-export: 0 */
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const REACT_STATICS = {
  childContextTypes: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  mixins: true,
  propTypes: true,
  type: true,
};

const KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  arguments: true,
  arity: true,
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

function hoistNonReactStatics(targetComponent, sourceComponent) {
  const component = targetComponent;
  const keys = Object.getOwnPropertyNames(sourceComponent);
  for (let index = 0; index < keys.length; ++index) {
    if (!REACT_STATICS[keys[index]] && !KNOWN_STATICS[keys[index]]) {
      component[keys[index]] = sourceComponent[keys[index]];
    }
  }

  return component;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent';
}
export function argumentContainer(Container, WrappedComponent, containerName) {
  const Con = Container;
  Con.displayName = `${containerName}(${getDisplayName(WrappedComponent)})`;
  Con.WrappedComponent = WrappedComponent;
  return hoistNonReactStatics(Con, WrappedComponent);
}

function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return x !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y; // eslint-disable-line no-self-compare
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
