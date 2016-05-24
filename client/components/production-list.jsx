import React, { PropTypes } from 'react';
import ProductionLink from './production-link';

export default class ProductionList extends React.Component {
  static propTypes = {
    status: PropTypes.object,
  };
  render() {
    const productions = [/* todo code with subdomain / token qs for different domain */
      { key: 'wetms', href: `${__PRODUCTIONS_DOMAIN_GROUP__.wetms}`, icon: '/assets/img/wetms.png', name: 'WeTMS', on: this.props.status.tms },
      { key: 'wewms', href: `${__PRODUCTIONS_DOMAIN_GROUP__.wewms}`, icon: '/assets/img/wewms.png', name: '仓管家', on: this.props.status.app },
      { key: 'che', href: `${__PRODUCTIONS_DOMAIN_GROUP__.che}`, icon: '/assets/img/yun56.png', name: '云管车', on: this.props.status.che }
    ];
    return (
      <li className="dropdown">
        <a data-toggle="dropdown" role="button" aria-expanded="false" className="dropdown-toggle">
          更多产品
          <span className="angle-down s7-angle-down"></span>
        </a>
        <ul className="dropdown-menu am-connections">
          <li>
            <div className="list">
              <div className="content">
                <ul>
                { productions.map(prd =>
                  <ProductionLink {...prd} />) }
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </li>
    );
  }
}
