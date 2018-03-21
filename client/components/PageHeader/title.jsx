import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';

export default function Title(props) {
  const { breadcrumb } = props;
  return (
    <div className="welo-page-header-title">
      <Breadcrumb>
        {breadcrumb && breadcrumb.map(item =>
          <Breadcrumb.Item key={String(item)} >{item}</Breadcrumb.Item>)}
      </Breadcrumb>
    </div>
  );
}
Title.props = {
  breadcrumb: PropTypes.arrayOf(PropTypes.node),
};
