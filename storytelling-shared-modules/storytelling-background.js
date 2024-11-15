// helper methods
import bindEvents from "../assets/helpers/bind-events";
import getOffsetBounds from "../assets/helpers/get-offset-bounds";

export const selector = "storytelling__background";

export default class StorytellingBackground {
  constructor(section, options) {
    this.el = {
      section,
      image: section.querySelector("img"),
    };

    // default options
    this.defaults = {
      animationData: null,
      index: 0,
      foregrounds: [],
    };

    // merge default options with param options
    this.options = { ...this.defaults, ...options };

    this.controller = options.controller;

    // bind events
    this.events = bindEvents(this);

    // class variables

    // foregrounds to track for animation
    this.boundaryForegrounds = {
      top: null,
      bottom: null,
    };

    // position rects
    this.bounds = {
      section: null,
      isBoundsUpdated: false,
    };

    this.flags = {
      isIntersecting: false,
    };

    const showImageTimeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: this.controller.el.foregrounds[this.options.index],
        start: this.options.index === 0 ? "top bottom" : "top 50%",
        toggleClass: {
          targets: this.el.section,

          className: `${selector}--show`,
        },
        end:
          this.controller.el.foregrounds.length - 1 === this.options.index
            ? "bottom top-=2000px"
            : "bottom top+=500px",
      },
    });

    this.controller.addToTimeline(showImageTimeline, 0);

    if (this.options.animationData && this.el.image) {
      const { animationData } = this.options;
      const { start, end } = animationData;

      const imgTween = window.gsap.fromTo(
        this.el.image,
        { ...start },
        { ...end, duration: 0.01 }
      );

      this.controller.addToTimeline(imgTween, this.options.index + 0.33);

      const transformOrigin =
        typeof animationData.transformOrigin !== "undefined"
          ? animationData.transformOrigin
          : "";

      this.el.section.style.setProperty("transformOrigin", transformOrigin);
    }
  }

  tick() {
    this.flags.isBoundsUpdated = false;
  }

  updateBounds(force = false) {
    if (!this.flags.isBoundsUpdated || force) {
      this.bounds.section = getOffsetBounds(this.el.section);
    }
    this.flags.isBoundsUpdated = true;
  }

  // set boundary foregrounds

  setBoundaryForegrounds(top, bottom) {
    Object.assign(this.boundaryForegrounds, {
      top,
      bottom,
    });
  }

  // set state

  clearState() {
    Object.assign(this.flags, {
      isTop: false,
      isBottom: false,
      isActive: false,
      isPrev: false,
    });
    this.el.section.classList.remove("active", "active-last");
  }

  setInactive() {
    this.clearState();
  }

  setActive() {
    this.clearState();
    this.flags.isActive = true;
    this.el.section.classList.add("active");
  }

  setPrev() {
    this.clearState();
    this.flags.isPrev = true;
    this.el.section.classList.add("active-last");
  }

  // getters

  get sectionBounds() {
    return this.bounds.section;
  }

  get section() {
    return this.el.section;
  }

  get index() {
    return this.options.index;
  }

  // destroy

  destroy() {
    this.el = null;
  }
}
