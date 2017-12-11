import React from 'react';
import { Icon, Popover, Tooltip, Tag } from 'antd';
import { Fontello } from 'client/components/FontIcon';

export default function makeColumns({ msg, units, tradeCountries, currencies, withRepo, withRepoItem, audit }) {
  const columns = [{
    dataIndex: 'classified',
    width: 40,
    render: (classified, item) => {
      if (classified) {
        return <Icon type="check-circle-o" style={{ fontSize: 16, color: '#52c41a' }} />;
      } else {
        let content;
        if (!(item.hscode && item.g_name && item.g_model)) {
          content = '申报商品编码或品名或规范要素未完整';
        } else {
          content = '填写规格型号与规范申报要素项数不一致';
        }
        return <Popover content={content} placement="right"><Icon type="warning" style={{ fontSize: 16, color: '#f5222d' }} /></Popover>;
      }
    },
  }, {
    title: msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 200,
    render: (o, record) => {
      const pn = o === record.src_product_no ? o : <span>{o}|{record.src_product_no}</span>;
      if (record.feedback === 'repeat') {
        return (
          <Tooltip title="新归类与原归类相同">
            <Tag color="orange">{pn}</Tag>
          </Tooltip>);
      } else if (record.duplicate) {
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
        return (
          <Tooltip title={`审核拒绝(${record.reason})`}>
            <Tag color="grey">{pn}</Tag>
          </Tooltip>);
      } else {
        return <span>{pn}</span>;
      }
    },
  }].concat(withRepoItem ? [{
    title: msg('preHscode'),
    dataIndex: 'item_hscode',
    width: 120,
    render: itemhscode => <span>{itemhscode}</span>,
  }, {
    title: msg('preGModel'),
    dataIndex: 'item_g_model',
    width: 300,
    render: pregmodel => <span>{pregmodel}</span>,
  }] : []).concat([{
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
      } else {
        return <span>{hscode}</span>;
      }
    },
  }, {
    title: msg('gName'),
    dataIndex: 'g_name',
    width: 200,
    render: (gname) => {
      if (!gname) {
        return <Tag color="red" />;
      } else {
        return gname;
      }
    },
  }, {
    title: msg('enName'),
    dataIndex: 'en_name',
    width: 200,
  }, {
    title: msg('gModel'),
    dataIndex: 'g_model',
    width: 400,
    render: (model) => {
      if (!model) {
        return <Tag color="red" />;
      } else {
        return model;
      }
    },
  }, {
    title: msg('gUnit1'),
    dataIndex: 'g_unit_1',
    width: 100,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('gUnit2'),
    dataIndex: 'g_unit_2',
    width: 100,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('gUnit3'),
    dataIndex: 'g_unit_3',
    width: 100,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('unit1'),
    dataIndex: 'unit_1',
    width: 130,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('unit2'),
    dataIndex: 'unit_2',
    width: 130,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 130,
    render: (o) => {
      const unit = units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: msg('origCountry'),
    dataIndex: 'origin_country',
    width: 120,
    render: (o) => {
      const country = tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }, {
    title: msg('unitNetWt'),
    dataIndex: 'unit_net_wt',
    width: 120,
  }, {
    title: msg('unitPrice'),
    dataIndex: 'unit_price',
    width: 120,
  }, {
    title: msg('currency'),
    dataIndex: 'currency',
    width: 120,
    render: (o) => {
      const currency = currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  /*
  }, {
    title: msg('customsControl'),
    dataIndex: 'customs_control',
    width: 140,
  }, {
    title: msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 140,
  }, {
    title: msg('preClassifyNo'),
    dataIndex: 'pre_classify_no',
    width: 120,
  }, {
    title: msg('preClassifyStartDate'),
    dataIndex: 'pre_classify_start_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_start_date) {
        return moment(record.pre_classify_start_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_end_date) {
        return moment(record.pre_classify_end_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  */
  }, {
    title: msg('remark'),
    dataIndex: 'remark',
    width: 180,
  }].concat(withRepo ? [{
    title: msg('repoOwner'),
    dataIndex: 'repo_owner_name',
    width: 200,
  }, {
    title: msg('repoCreator'),
    dataIndex: 'contribute_tenant_name',
    width: 200,
  }] : []));
  if (!audit) {
    columns.push({
      title: '本库审核',
      dataIndex: 'pass',
      width: 80,
      render: (pass) => {
        if (pass === 'Y') {
          return <Tooltip title="提交直接通过"><span><Fontello type="circle" color="green" /></span></Tooltip>;
        } else {
          return <Tooltip title="需人工审核"><span><Fontello type="circle" color="gray" /></span></Tooltip>;
        }
      },
    }, {
      title: '主库审核',
      dataIndex: 'master_repo_id',
      width: 80,
      render: (masterRepo) => {
        if (masterRepo) {
          return <Tooltip title="可提交主库审核"><span><Fontello type="circle" color="green" /></span></Tooltip>;
        } else {
          return <Tooltip title="只需本库审核"><span><Fontello type="circle" color="gray" /></span></Tooltip>;
        }
      } });
  }
  return columns;
}

