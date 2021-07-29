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

  const ELEMENT = {
    INPUT_FILE: '[name="file"]',
    PATH_EL   : 'sheet-path'
  };

  const {INPUT_FILE, PATH_EL} = ELEMENT;

  const bindFilePath = _ => {
    const setFilePath = e => {
      console.log(e.target)
      const fileName = e.target.files[0].name;
      const pathEl = docSelector({el: `.${PATH_EL}`})
      pathEl.textContent = fileName;
    };

    const getFilePath = _ => {
      const inputFile = docSelector({el: INPUT_FILE});
      inputFile.addEventListener('change', setFilePath);
    };

    getFilePath();
  };

  const init = _ => {
    window.addEventListener('touchstart', _ => {});
    bindFilePath();
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