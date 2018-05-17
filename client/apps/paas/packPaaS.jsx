import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout } from 'antd';
import CorpHeaderBar from 'client/components/corpHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';
import { formatMsg } from './message.i18n';

const { Header } = Layout;

@injectIntl
@connect()
export default class PaaSPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }
  componentWillMount() {
    this.props.dispatch(setNavTitle({
      depth: 1,
    }));
  }
  msg = formatMsg(this.props.intl);
  render() {
    return (
      <Layout className="welo-layout-wrapper">
        <Header>
          <CorpHeaderBar title={this.msg('paas')} />
        </Header>
        <Layout>
          {this.props.children}
        </Layout>
      </Layout>
    );
  }
}
