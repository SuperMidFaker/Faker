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
  type: true
};

const KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  arguments: true,
  arity: true
};


function hoistNonReactStatics(targetComponent, sourceComponent) {
  const keys = Object.getOwnPropertyNames(sourceComponent);
  for (let index = 0; index < keys.length; ++index) {
    if (!REACT_STATICS[keys[index]] && !KNOWN_STATICS[keys[index]]) {
      targetComponent[keys[index]] = sourceComponent[keys[index]];
    }
  }

  return targetComponent;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent';
}
export function argumentContainer(Container, WrappedComponent, containerName) {
  Container.displayName = `${containerName}(${getDisplayName(WrappedComponent)})`;
  Container.WrappedComponent = WrappedComponent;
  return hoistNonReactStatics(Container, WrappedComponent);
}
