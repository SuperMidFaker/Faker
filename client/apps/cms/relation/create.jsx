import React, { Component, PropTypes } from 'react';
import { Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import CompRelationForm from './compRelationForm';
import { initialState } from 'common/reducers/cmsCompRelation';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;

@injectIntl
@connectNav({
  depth: 3,
  text: props => `${formatMsg(props.intl, 'new')}${formatMsg(props.intl, 'relation')}`,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'relation', action: 'create' })
export default class CreateCompRelation extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadCompRelations: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  render() {
    return (
      <Content className="main-content">
        <div className="page-body">
          <CompRelationForm router={this.context.router} formData={initialState.formData} />
        </div>
      </Content>
    );
  }
}
