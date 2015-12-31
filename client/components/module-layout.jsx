import React, { PropTypes } from 'react';
import NavLink from '../../reusable/components/nav-link';
import {Row, Col} from '../../reusable/ant-ui';
import './module-layout.less';

export default class ModuleLayout extends React.Component {
  static propTypes = {
    size: PropTypes.oneOf(['', 'large'])
  };
 
  render() {
    const containerCls = 'module-container' + (this.props.size ? (' ' + this.props.size) : '');
    return (
      <Row type="flex" justify="space-between">
        <Col span="6">
          <div className={containerCls}>
            <NavLink to>
              <div className="module-import">
                <img src="/assets/img/home/import.png" />
              </div>
              <span className="module-text">进口</span>
            </NavLink>
          </div>
        </Col>
        <Col span="6">
          <div className={containerCls}>
            <div className="module-export">
              <NavLink to><img src="/assets/img/home/export.png" /></NavLink>
            </div>
            <span className="module-text">出口</span>
          </div>
        </Col>
        <Col span="6">
          <div className={containerCls}>
            <div className="module-tms">
              <NavLink to><img src="/assets/img/home/tms.png" /></NavLink>
            </div>
            <span className="module-text">运输</span>
          </div>
        </Col>
        <Col span="6">
          <div className={containerCls}>
            <div className="module-wms">
              <NavLink to><img src="/assets/img/home/wms.png" /></NavLink>
            </div>
            <span className="module-text">WMS</span>
          </div>
        </Col>
        <Col span="4">
          <div className={containerCls}>
            <div className="module-payment">
              <NavLink to><img src="/assets/img/home/payment.png" /></NavLink>
            </div>
            <span className="module-text">付汇</span>
          </div>
        </Col>
        <Col span="4">
          <div className="module-container">
            <div className="module-receipt">
              <NavLink to><img src="/assets/img/home/receipt.png" /></NavLink>
            </div>
            <span className="module-text">收汇</span>
          </div>
        </Col>
      </Row>);
  }
}
