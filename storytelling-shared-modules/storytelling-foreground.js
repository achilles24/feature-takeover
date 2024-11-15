// helper methods
import bindEvents from "../assets/helpers/bind-events";
import mq from "../assets/helpers/mq";

export const selector = "storytelling__foreground";

export default class StorytellingForeground {
  constructor(section, options) {
    this.el = {
      section,
      contentWrapper: section.querySelector(`.${selector}-content-wrapper`),
      innerContentContainer: null,
    };

    // default options
    this.defaults = {
      index: 0,
      backgrounds: [],
    };

    // merge default options with param options
    this.options = { ...this.defaults, ...options };

    // bind events
    this.events = bindEvents(this);

    // class variables

    // position rects
    this.bounds = {
      innerContent: null,
      section: null,
    };

    // state flags
    this.flags = {
      isTop: false,
      isBottom: false,
      isActive: false,
      isInactive: true,
      isPrev: false,
      isBoundsUpdated: false,
    };

    this.init();
  }

  init() {
    const textTween = window.gsap.fromTo(
      this.el.section,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "power1",
        duration: 0.5,
      }
    );

    const textMoveTimeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: this.el.section,
        start: () => `top ${mq("medium") ? "66%" : "50%"}`,
        onEnter: () => {
          this.el.section.classList.add("is-on-screen");
        },
        onLeaveBack: () => {
          this.el.section.classList.remove("is-on-screen");
        },
        end: "bottom top+=500px",
      },
    });

    this.options.controller.addToTimeline(textMoveTimeline, 0);
    this.options.controller.addToTimeline(textTween, this.options.index + 1);
  }

  tick() {
    this.flags.isBoundsUpdated = false;
  }
  // set state

  clearState() {
    Object.assign(this.flags, {
      isTop: false,
      isBottom: false,
      isActive: false,
      isInactive: true,
      isPrev: false,
    });
    this.el.section.classList.remove(
      "active",
      "active-last",
      "is-top",
      "is-bottom"
    );
  }

  setInactive() {
    this.clearState();
  }

  setActive() {
    this.clearState();
    this.flags.isActive = true;
    this.flags.isInactive = false;
    this.el.section.classList.add("active");
  }

  setPrev() {
    this.clearState();
    this.flags.isPrev = true;
    this.flags.isInactive = false;
    this.el.section.classList.add("active-last");
  }

  setTop() {
    this.clearState();
    this.flags.isTop = true;
    this.flags.isInactive = false;
    this.el.section.classList.add("is-top");
  }

  setBottom() {
    this.clearState();
    this.flags.isBottom = true;
    this.flags.isInactive = false;
    this.el.section.classList.add("is-bottom");
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
}
