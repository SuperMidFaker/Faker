import _ from 'lodash';

// adapt from http://stackoverflow.com/a/14484332
export default class DataGrouper {
  has(objs, target) {
    return _.some(objs, (obj) => _.isEqual(obj, target));
  }
  keys(data, keySelectors) {
    return _.reduce(data, (prev, item) => {
      const key = _.pick(item, keySelectors);
      if (!this.has(prev, key)) {
        prev.push(key);
      }
      return prev;
    }, []);
  }
  group(data, keySelectors) {
    const stems = this.keys(data, keySelectors);
    return _.map(stems, (stem) => ({
      key: stem,
      elements: _.map(_.filter(data, stem), item => _.omit(item, keySelectors)),
    }));
  }
  register(name, converter) {
    this[name] = (data, keySelectors) => {
      const groups = this.group(data, keySelectors);
      return _.map(groups, converter);
    };
  }
}
