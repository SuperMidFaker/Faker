import hoistStatics from '../util/hoist-non-react-statics';
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'WrappedComponent';
}
export function argumentContainer(Container, WrappedComponent, containerName) {
  Container.displayName = `${containerName}(${getDisplayName(WrappedComponent)})`;
  Container.WrappedComponent = WrappedComponent;
  return hoistStatics(Container, WrappedComponent);
}
