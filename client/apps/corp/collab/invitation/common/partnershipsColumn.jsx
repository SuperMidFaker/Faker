import React from 'react';
import PropTypes from 'prop-types';

export default class PartnershipsColumn extends React.Component {
  static propTypes = {
    partnerships: PropTypes.array.isRequired,
  }

  render() {
    const { partnerships } = this.props;
    const strArray = [];
    for (let i = 0; i < partnerships.length; i++) {
      if (partnerships[i].business_type && partnerships[i].role) {
        strArray.push(`${partnerships[i].business_type}${partnerships[i].role}`);
      }
    }
    let str = strArray.join(';');
    str = str.replace(/clearance/g, '清关');
    str = str.replace(/transport/g, '运输');
    str = str.replace(/warehousing/g, '仓储');
    str = str.replace(/CUS/g, '客户');
    str = str.replace(/VEN/g, '供应商');
    return (
      <div>{str}</div>
    );
  }
}
