import React from 'react';
import { Icon, Popover, Tooltip, Tag } from 'antd';
import { Logixon } from 'client/components/FontIcon';

export default function makeColumns({
  msg, withRepo, withRepoItem, audit,
}) {
  const columns = [{
    title: msg('标记'),
    dataIndex: 'status',
    width: 45,
    align: 'center',
    fixed: 'left',
    render: (status, item) => {
      if (status === 0) {
        if (item.classified) {
          return (<Popover content="新商品货号已完成归类" placement="right">
            <span><Logixon type="new" style={{ fontSize: 16, color: '#52c41a' }} /></span>
          </Popover>);
        }
        let content;
        if (!(item.hscode && item.g_name && item.g_model)) {
          content = '商品编码、中文品名或规范申报要素尚未填写完整';
        } else {
          content = '规格申报要素未按海关要求规范填写';
        }
        return (<Popover content={content} placement="right">
          <span><Logixon type="new" style={{ fontSize: 16, color: '#f5222d' }} /></span>
        </Popover>);
      } else if (status === 1) {
        const content = [];
        if (item.hscode !== item.item_hscode) {
          content.push('商品编码不一致 ');
        }
        if (item.g_name !== item.item_g_name) {
          content.push('中文品名不一致 ');
        }
        if (item.g_model !== item.item_g_model) {
          content.push('规范申报要素不一致 ');
        }
        return (<Popover content={content} placement="right">
          <Icon type="exclamation-circle-o" style={{ fontSize: 16, color: '#f5222d' }} />
        </Popover>);
      } else if (status === 2) {
        return (<Popover content="已设为主数据" placement="right">
          <Icon type="pushpin" style={{ fontSize: 16, color: '#52c41a' }} />
        </Popover>);
      } else if (status === 3) {
        return '忽略';
      } else if (status === 4) {
        return (<Popover content="已保留为分支版本" placement="right">
          <Icon type="fork" style={{ fontSize: 16, color: '#52c41a' }} />
        </Popover>);
      } else if (status === -1 || status === -2 || status === -3 || status === -4) {
        let tooltip = '';
        if (status === -1 || status === -2) {
          tooltip = '税则已删除商品编码';
        } else if (status === -3 || status === -4) {
          tooltip = '税则已变更申报要素';
        }
        let iconInfo = { type: 'disconnect', color: '#f5222d' };
        if (item.classified) {
          iconInfo = { type: 'link', color: '#52c41a' };
        }
        return (<Popover content={tooltip} placement="right">
          <Icon type={iconInfo.type} style={{ fontSize: 16, color: iconInfo.color }} />
        </Popover>);
      }
      return <span />;
    },
  }, {
    title: msg('repoOwner'),
    dataIndex: 'repo_owner_name',
    width: 200,
  }, {
    title: msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 150,
    render: (o, record) => {
      const pn = o === record.src_product_no ? o :
      <Popover content={record.src_product_no}>{o}</Popover>;
      if (record.duplicate) {
        return (
          <Tooltip title="导入货号重复造成冲突">
            <Tag color="red">{pn}</Tag>
          </Tooltip>);
      } else if (record.feedback === 'createdByOther') {
        return (
          <Tooltip title="原归类信息由其他租户创建">
            <Tag color="blue">{pn}</Tag>
          </Tooltip>);
      } else if (record.rejected) {
        let reason = '';
        if (record.reason) {
          reason = `: ${record.reason}`;
        }
        return (
          <Tooltip title={`审核拒绝${reason}`}>
            <Tag color="grey">{pn}</Tag>
          </Tooltip>);
      }
      return <span>{pn}</span>;
    },
  }, {
    title: msg('enName'),
    dataIndex: 'en_name',
    width: 200,
  }, {
    title: msg('hscode'),
    dataIndex: 'hscode',
    width: 120,
    render: (hscode) => {
      if (!hscode) {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="red">{hscode}</Tag>
          </Tooltip>
        );
      }
      return <span>{hscode}</span>;
    },
  }].concat(withRepoItem ? [{
    title: msg('preHscode'),
    dataIndex: 'item_hscode',
    width: 120,
    render: (itemhscode, record) => (itemhscode === record.hscode ? <span>{itemhscode}</span> : <Tag color="red">{itemhscode}</Tag>),
  }] : []).concat([{
    title: msg('gName'),
    dataIndex: 'g_name',
    width: 200,
    render: (gname) => {
      if (!gname) {
        return <Tag color="red" />;
      }
      return gname;
    },
  }].concat(withRepoItem ? [{
    title: msg('preGName'),
    dataIndex: 'item_g_name',
    width: 200,
    render: (pregname, record) => (pregname === record.g_name ? <span>{pregname}</span> : <Tag color="red">{pregname}</Tag>),
  }] : []).concat([{
    title: msg('gModel'),
    dataIndex: 'g_model',
    width: 400,
    render: (model) => {
      if (!model) {
        return <Tag color="red" />;
      }
      return model;
    },
  }].concat(withRepoItem ? [{
    title: msg('preGModel'),
    dataIndex: 'item_g_model',
    width: 400,
    render: (pregmodel, record) => (pregmodel === record.g_model ? <span>{pregmodel}</span> : <Tag color="red">{pregmodel}</Tag>),
  }] : [])
    .concat(withRepo ? [{
      title: msg('repoCreator'),
      dataIndex: 'contribute_tenant_name',
      width: 200,
    }] : [])));
  if (!audit) {
    columns.push({
      title: '本库审核',
      dataIndex: 'pass',
      width: 80,
      render: (pass) => {
        if (pass === 'Y') {
          return <Tooltip title="提交直接通过"><span><Logixon type="circle" color="green" /></span></Tooltip>;
        }
        return <Tooltip title="需人工审核"><span><Logixon type="circle" color="gray" /></span></Tooltip>;
      },
    }, {
      title: '主库审核',
      dataIndex: 'master_repo_id',
      width: 80,
      render: (masterRepo, row) => {
        let master = masterRepo;
        if (master && row.item_id && !row.master_id) {
          master = false;
        }
        if (master) {
          return <Tooltip title="可提交主库审核"><span><Logixon type="circle" color="green" /></span></Tooltip>;
        }
        return <Tooltip title="只可提交本库"><span><Logixon type="circle" color="gray" /></span></Tooltip>;
      },
    });
  }
  return columns;
}

