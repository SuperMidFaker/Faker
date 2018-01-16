import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import CorpHeaderBar from 'client/components/corpHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Header } = Layout;

@connect()
export default class DataHubPack extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }
  componentWillMount() {
    this.props.dispatch(setNavTitle({
      depth: 1,
    }));
  }
  render() {
    return (
      <Layout className="welo-layout-wrapper">
        <Header>
          <CorpHeaderBar title="协作平台" />
        </Header>
        <Layout>
          {this.props.children}
        </Layout>
      </Layout>
    );
  }
}
