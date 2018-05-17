import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { sync as globSync } from 'glob';

const MESSAGES_DIR = './public/dist/messages/';
const MESSAGES_PATTERN = './public/dist/messages/**/*.json';
const LANG_DIR = './public/assets/langs/';

// Aggregates the default messages that were extracted from the app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync(MESSAGES_PATTERN)
  .map((filename) => {
    console.log(`processing ${filename}`);
    return fs.readFileSync(filename, 'utf8');
  })
  .map(file => JSON.parse(file))
  .reduce((collection, descriptors) => {
    descriptors.forEach(({ id, defaultMessage }) => {
      if (collection.hasOwnProperty(id)) {
        throw new Error(`Duplicate message id: ${id}`);
      }

      collection[id] = defaultMessage;
    });

    return collection;
  }, {});

globSync(`${LANG_DIR}*.json`).forEach((filename) => {
  const basename = path.basename(filename);
  if (basename === 'en.json') {
    const langjson = fs.readFileSync(filename, 'utf8');
    const langTr = JSON.parse(langjson);
    const diff = {};
    Object.keys(defaultMessages).forEach((mkey) => {
      if (!langTr[mkey]) {
        diff[mkey] = defaultMessages[mkey];
      }
    });
    let langChanged = false;
    Object.keys(langTr).forEach((trkey) => {
      if (!defaultMessages[trkey]) {
        console.log(trkey);
        delete langTr[trkey];
        langChanged = true;
      }
    });
    if (Object.keys(diff).length > 0) {
      fs.writeFileSync(`${LANG_DIR}diff-${basename}`, JSON.stringify(diff, null, 2));
    }
    if (langChanged) {
      fs.writeFileSync(filename, JSON.stringify(langTr, null, 2));
    }
  }
});
fs.writeFileSync(`${LANG_DIR}zh.json`, JSON.stringify(defaultMessages, null, 2));
rimraf.sync(MESSAGES_DIR, { glob: false });
