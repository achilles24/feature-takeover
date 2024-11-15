// helper methods
import bindEvents from "../assets/helpers/bind-events";
import mq from "../assets/helpers/mq";

export const selector = "storytelling__border";

export default class StorytellingBorder {
  constructor(section, options) {
    this.el = {
      section,
      borderTop: section.querySelector(`.${selector}-top`),
      borderRight: section.querySelector(`.${selector}-right`),
      borderBottom: section.querySelector(`.${selector}-bottom`),
      borderLeft: section.querySelector(`.${selector}-left`),
    };

    // default options
    this.defaults = {
      foregrounds: {
        top: null,
        bottom: null,
      },
    };

    // merge default options with param options
    this.options = { ...this.defaults, ...options };

    this.controller = options.controller;

    // bind events
    this.events = bindEvents(this);

    // let's roll
    this.init();
  }

  // init

  init() {
    const duration = mq("medium") ? 0.6 : 0.4;
    const offset = mq("medium") ? 0.1 : 0.333;

    const settings = {
      ease: "power2.out",
      duration,
    };

    const borderTimeline = window.gsap
      .timeline()
      .fromTo(this.el.borderTop, { scaleY: 1 }, { scaleY: 0, ...settings })
      .fromTo(
        this.el.borderRight,
        { scaleX: 1 },
        { scaleX: 0, ...settings },
        "<"
      )
      .fromTo(
        this.el.borderBottom,
        { scaleY: 1 },
        { scaleY: 0, ...settings },
        "<"
      )
      .fromTo(
        this.el.borderLeft,
        { scaleX: 1 },
        { scaleX: 0, ...settings },
        "<"
      );

    this.controller.addToTimeline(borderTimeline, 1 - offset);
  }
}
