import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, RoutingContext } from 'react-router';
import ReduxDevTool from '../reusable/components/redux-devtool';
import routes from './routes';

export default class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    routingContext: PropTypes.object,
    routerHistory: PropTypes.object
  }
  renderDevTools () {
    return <div></div>;
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
    return (
      <Provider store={this.props.store}>
        <div className="full-container">
        { this.renderRouter() }
        { __DEVTOOLS__ && <ReduxDevTool /> }
        </div>
      </Provider>
    );
  }
}
