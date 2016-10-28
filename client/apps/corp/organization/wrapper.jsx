import React, { PropTypes } from 'react';

export default class OrganizationWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
  };
  render() {
    return (
      <div>
        <div className="main-content">
          {this.props.children}
        </div>
      </div>
      );
  }
}
