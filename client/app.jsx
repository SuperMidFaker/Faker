import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, RoutingContext } from 'react-router';
import routes from './routes';

export default class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    routingContext: PropTypes.object,
    routerHistory: PropTypes.object
  }
  renderDevTools () {
    const ReduxDevTool = require('../reusable/components/redux-devtool');
    return <ReduxDevTool />;
  }

  renderRouter () {
    if (this.props.routingContext) {
      return <RoutingContext {...this.props.routingContext} />;
    } else {
      return (
        <Router history={this.props.routerHistory}>
        {routes(this.props.store)}
        </Router>
      );
    }
  }

  render () {
    const { store } = this.props;
    return (
      <Provider store={store}>
          <div className="full-container">
          { this.renderRouter() }
          { __DEVTOOLS__ && this.renderDevTools() }
          </div>
      </Provider>
    );
  }
}
