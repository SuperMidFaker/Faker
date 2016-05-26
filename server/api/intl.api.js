import { sync as globSync } from 'glob';
import { readFileSync } from 'fs';
import * as path from 'path';
import Result from '../util/responseResult';

function *getIntlMessages() {
  const locale = this.request.query.locale;
  const translations = globSync('./public/assets/langs/*.json')
    .map(filename => [
      path.basename(filename, '.json'),
      readFileSync(filename, 'utf8')
    ])
    .map(([locale, file]) => [locale, JSON.parse(file)])
    .reduce((collection, [locale, messages]) => {
      collection[locale] = messages;
      return collection;
    }, {});
    const messages = translations[locale];
    return messages ? Result.ok(this, messages) : Result.notFound(this);
}

export default [
   ['get', '/public/v1/intl/messages', getIntlMessages]
];
