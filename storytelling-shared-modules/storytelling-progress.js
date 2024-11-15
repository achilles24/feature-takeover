// helper methods
import bindEvents from "../assets/helpers/bind-events";

export const selector = "storytelling__progress";

export default class StorytellingProgress {
  constructor(section, options) {
    this.el = {
      section,
      track: section.querySelector(`.${selector}-track`),
      bg: section.querySelector(`.${selector}-bg`),
    };

    // default options
    this.defaults = {
      controller: null,
    };

    // merge default options with param options
    this.options = { ...this.defaults, ...options };

    this.controller = options.controller;

    // bind events
    this.events = bindEvents(this);

    // class variables

    this.coords = {
      controller: null,
    };

    this.flags = {};

    // track foreground position to tween background based on config

    this.init();
  }

  init() {
    // alright let's get started
    const progressTween = window.gsap.fromTo(
      this.el.track,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        duration: this.controller.getDuration() - 1,
      }
    );

    this.controller.addToTimeline(progressTween, 1);
  }
}
