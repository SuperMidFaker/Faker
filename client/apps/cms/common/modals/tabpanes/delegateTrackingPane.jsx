import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Steps } from 'antd';

const Step = Steps.Step;
const timeFormat = 'YYYY-MM-DD HH:mm';

@injectIntl
@connect(
  state => ({
    previewer: state.cmsDelgInfoHub.previewer,
  })
)
export default class DelegatedelegateTrackingPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  render() {
    const { previewer } = this.props;
    const { delegation, delgDispatch } = previewer;
    let delegateTrackingDes = [];
    if (delgDispatch === null) {
      delegateTrackingDes = [{
        status: 'wait',
        title: '创建',
        description: '',
      }, {
        status: 'wait',
        title: '委托发送',
        description: '',
      }, {
        status: 'wait',
        title: '接受委托',
        description: '',
      }, {
        status: 'wait',
        title: '提交海关',
        description: '',
      }, {
        status: 'wait',
        title: '海关放行',
        description: '',
      }];
    } else if (delegation.status === 0) {
      delegateTrackingDes = [{
        status: 'finish',
        title: '创建',
        description: `${delegation.created_date ? moment(delegation.created_date).format(timeFormat) : ''}`,
      }, {
        status: 'wait',
        title: '委托发送',
        description: '',
      }, {
        status: 'wait',
        title: '接受委托',
        description: '',
      }, {
        status: 'wait',
        title: '提交海关',
        description: '',
      }, {
        status: 'wait',
        title: '海关放行',
        description: '',
      }];
    } else if (delegation.status === 1) {
      delegateTrackingDes = [{
        status: 'finish',
        title: '创建',
        description: `${delegation.created_date ? moment(delegation.created_date).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '委托发送',
        description: `${delgDispatch.delg_time ? moment(delgDispatch.delg_time).format(timeFormat) : ''}`,
      }, {
        status: 'wait',
        title: '接受委托',
        description: '',
      }, {
        status: 'wait',
        title: '提交海关',
        description: '',
      }, {
        status: 'wait',
        title: '海关放行',
        description: '',
      }];
    } else if (delegation.status === 2) {
      delegateTrackingDes = [{
        status: 'finish',
        title: '创建',
        description: `${delegation.created_date ? moment(delegation.created_date).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '委托发送',
        description: `${delgDispatch.delg_time ? moment(delgDispatch.delg_time).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '接受委托',
        description: `${delgDispatch.acpt_time ? moment(delgDispatch.acpt_time).format(timeFormat) : ''}`,
      }, {
        status: 'wait',
        title: '提交海关',
        description: '',
      }, {
        status: 'wait',
        title: '海关放行',
        description: '',
      }];
    } else if (delegation.status === 3) {
      delegateTrackingDes = [{
        status: 'finish',
        title: '创建',
        description: `${delegation.created_date ? moment(delegation.created_date).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '委托发送',
        description: `${delgDispatch.delg_time ? moment(delgDispatch.delg_time).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '接受委托',
        description: `${delgDispatch.acpt_time ? moment(delgDispatch.acpt_time).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '提交海关',
        description: `${delgDispatch.decl_time ? moment(delgDispatch.decl_time).format(timeFormat) : ''}`,
      }, {
        status: 'wait',
        title: '海关放行',
        description: '',
      }];
    } else if (delegation.status === 4) {
      delegateTrackingDes = [{
        status: 'finish',
        title: '创建',
        description: `${delegation.created_date ? moment(delegation.created_date).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '委托发送',
        description: `${delgDispatch.delg_time ? moment(delgDispatch.delg_time).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '接受委托',
        description: `${delgDispatch.acpt_time ? moment(delgDispatch.acpt_time).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '提交海关',
        description: `${delgDispatch.decl_time ? moment(delgDispatch.decl_time).format(timeFormat) : ''}`,
      }, {
        status: 'finish',
        title: '海关放行',
        description: `${delgDispatch.clea_time ? moment(delgDispatch.clea_time).format(timeFormat) : ''}`,
      }];
    }

    const delegateTrackingSteps = delegateTrackingDes.map((s, i) => <Step key={i} status={s.status} title={s.title} description={s.description} />);
    return (
      <div className="pane-content tab-pane">
        <Steps current={delegation.status} direction="vertical">
          {delegateTrackingSteps}
        </Steps>
      </div>
    );
  }
}
