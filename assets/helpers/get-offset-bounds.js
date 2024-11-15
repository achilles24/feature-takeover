export default (el, includeScrollPosition = true, scrollContainer = window) => {
  if (el) {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = el;

    const bounds = {
      top: offsetTop,
      bottom: offsetTop + offsetHeight,
      left: offsetLeft,
      right: offsetLeft + offsetWidth,
      width: offsetWidth,
      height: offsetHeight,
      centerX: (offsetLeft + offsetWidth) / 2,
      centerY: (offsetLeft + offsetHeight) / 2,
    };

    if (includeScrollPosition) {
      const bcr = el.getBoundingClientRect();
      bounds.scrollTop = bcr.top + scrollContainer.scrollY;
      bounds.scrollBottom = bounds.scrollTop + bounds.height;
      bounds.scrollLeft = bcr.left + scrollContainer.scrollX;
      bounds.scrollRight = bounds.scrollLeft + bounds.width;
    }

    return bounds;
  }
  return null;
};
