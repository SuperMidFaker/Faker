// https://github.com/sindresorhus/multi-download
function fallback(files) {
  let i = 0;

  (function createIframe() {
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.src = files[i++].url;
    document.documentElement.appendChild(frame);

    // the download init has to be sequential otherwise IE only use the first
    const interval = setInterval(() => {
      if (frame.contentWindow.document.readyState === 'complete') {
        clearInterval(interval);

        // Safari needs a timeout
        setTimeout(() => {
          frame.parentNode.removeChild(frame);
        }, 1000);

        if (i < files.length) {
          createIframe();
        }
      }
    }, 100);
  }());
}

function isFirefox() {
  // sad panda :(
  return /Firefox\//i.test(navigator.userAgent);
}

function sameDomain(url) {
  const a = document.createElement('a');
  a.href = url;

  return location.hostname === a.hostname && location.protocol === a.protocol;
}

function download(url, filename) {
  const link = document.createElement('a');
  link.setAttribute('download', filename);
  link.href = url;
  // firefox doesn't support `a.click()`...
  link.dispatchEvent(new MouseEvent('click'));
}

export default function downloadMultiple(files) {
  if (!files) {
    throw new Error('`files` required');
  }

  if (typeof document.createElement('a').download === 'undefined') {
    return fallback(files);
  }

  let delay = 0;

  files.forEach((file) => {
    // the download init has to be sequential for firefox if the urls are not on the same domain
    if (isFirefox() && !sameDomain(file.url)) {
      setTimeout(download.bind(null, file.url, file.name), 100 * ++delay);
    }

    download(file.url, file.name);
  });
  return null;
}
