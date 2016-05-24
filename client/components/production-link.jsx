import React, { PropTypes } from 'react';

export default class ProductionLink extends React.Component {
  static propTypes = {
    href: PropTypes.string,
    icon: PropTypes.string,
    name: PropTypes.string,
    on: PropTypes.bool
  };
  render() {
    const { href, icon, name, on } = this.props;
    return (
      <li>
        <a href={href} target='_blank'>
          <div className='logo'>
            <img src={icon} />
          </div>
          <div className='field'>
            <span>{name}</span>
            <div className='pull-right'>
              <span className='label label-success'>{on ? '已开通' : '未开通'}</span>
            </div>
          </div>
        </a>
      </li>
    );
  }
}
