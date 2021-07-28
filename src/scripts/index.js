const commonJS = (_ => {
  const docSelector = ({
    el,
    all: isAll
  }) => {
    if (isAll) {
      return document.querySelectorAll(el);
    } else {
      return document.querySelector(el);
    }
  };

  const createEl = ({tag, attribute}) => {
    const el = document.createElement(tag);
    Object.assign(el, attribute);
    return el;
  };

  const init = _ => {
    window.addEventListener('touchstart', _ => {});
    console.log('init');
  };

  return {
    init
  };
})();

if (document.readyState === 'complete') {
  commonJS.init();
} else if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', commonJS.init);
}