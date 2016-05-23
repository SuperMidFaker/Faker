export function isLoaded(state, reducer) {
  return state[reducer] && state[reducer].loaded;
}

export function createActionTypes(domain, actions) {
  const actionType = {};
  actions.forEach((action) => {
    actionType[action] = `${domain}${action}`;
  });
  return actionType;
}
