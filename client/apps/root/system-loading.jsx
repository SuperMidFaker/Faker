import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import './root.less';
@connect(
  state => ({
    loading: state.auth.loading,
  })
)
export default class SystemLoading extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }

  render() {
    if (this.props.loading) {
      return (
        <div className="drawing" id="loading">
          <div className="loading-dot"></div>
          <div style={{ display: 'none' }}>
          {this.props.children}
          </div>
        </div>
      );
    } else {
      return (this.props.children);
    }
  }
}
