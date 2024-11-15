export default (el, _haystack = null) => {
  const haystack = _haystack || el.parentElement.children;
  for (let i = 0; i < haystack.length; i += 1) {
    if (el === haystack[i]) {
      return i;
    }
  }
  return -1;
};
