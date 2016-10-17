import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, RouterContext } from 'react-router';

export default (routes, dynamic) => {
  class App extends Component {
    static propTypes = {
      store: PropTypes.object.isRequired,
      routingContext: PropTypes.object,
      routerHistory: PropTypes.object,
    }

    renderRouter() {
      if (this.props.routingContext) {
        return <RouterContext {...this.props.routingContext} />;
      } else {
        if (dynamic) {
          return (
            <Router history={this.props.routerHistory} routes={routes} />
          );
        }
        return (
          <Router history={this.props.routerHistory}>
            {routes(this.props.store)}
          </Router>
        );
      }
    }

    render() {
      const { store } = this.props;
      return (
        <Provider store={store}>
          <div className="full-container">
            {this.renderRouter()}
          </div>
        </Provider>
      );
    }
  }

  return App;
};
