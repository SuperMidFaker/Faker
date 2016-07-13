function fetchDeferredState(components, locals) {
	                    const fetchers = components.filter((component) => component && component.deferredfetchers) // only look at ones with a static prefetcher
	.map((component) => component.deferredfetchers)    // pull out fetch data methods
  .reduce((fetchers, fetcher) => fetchers.concat(fetcher), [])
	.map(fetchData => fetchData(locals));  // call fetch data methods and save promises
  return Promise.all(fetchers);
}

function prefetchState(components, locals) {
	                    const fetchers = components.filter((component) => component && component.prefetchers) // only look at ones with a static prefetcher
	.map((component) => component.prefetchers)    // pull out fetch data methods
  .reduce((fetchers, fetcher) => fetchers.concat(fetcher), [])
	.map(fetchData => fetchData(locals));  // call fetch data methods and save promises
  return Promise.all(fetchers);
}

export default (components, store, cookie, location, params) => {
  return new Promise(resolve => {
    const doTransition = () => {
      fetchDeferredState(components, { state: store.getState(), dispatch: store.dispatch, cookie, location, params })
        .then(resolve)
        .catch(error => {
          // TODO: there is no error return here for api promise, maybe we need handle failure
          // in then
          console.warn('Warning: Error in fetchDataDeferred', error);
          return resolve();
        });
    };

    return prefetchState(components, { state: store.getState(), dispatch: store.dispatch, cookie, location, params })
      .then(doTransition)
      .catch(error => {
        console.warn('Warning: Error in fetchData', error);
        return doTransition();
      });
  });
};
