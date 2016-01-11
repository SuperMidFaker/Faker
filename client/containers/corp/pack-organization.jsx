import React, { PropTypes } from 'react';

export default class OrganizationWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };
  render() {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>组织机构</h2>
        </div>
        {this.props.children}
      </div>);
  }
}
