import "./storytelling-scroller.scss";
import "./_storytelling-scroller-critical.scss";
import "./mixins/_breakpoints.scss";
/* eslint-disable import/first */
import { parse as parseTransform } from "transform-parser";

import { gsap } from "gsap";

import { CSSPlugin } from "gsap/CSSPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// helper methods
import bindEvents from "./assets/helpers/bind-events.js";
import getElementIndex from "./assets/helpers/get-element-index.js";
import getOffsetBounds from "./assets/helpers/get-offset-bounds.js";

import StorytellingForeground from "./storytelling-shared-modules/storytelling-foreground.js";
import StorytellingBackground from "./storytelling-shared-modules/storytelling-background.js";
import StorytellingBorder from "./storytelling-shared-modules/storytelling-border.js";
import StorytellingProgress from "./storytelling-shared-modules/storytelling-progress.js";

const selector = "storytelling-scroller";

export default class StorytellingScroller {
  constructor(section, options) {
    this.el = {
      section,
      backgrounds: section.querySelectorAll(`.${selector}__background`),
      backgroundActive: null,
      backgroundsWithContent: null,
      backgroundsWrapper: section.querySelector(`.${selector}__backgrounds`),
      border: section.querySelector(`.${selector}__border`),
      foregrounds: section.querySelectorAll(`.${selector}__foreground`),
      foregroundActive: null,
      foregroundContents: section.querySelectorAll(
        `.${selector}__foreground-content-wrapper`
      ),
      foregroundsWrapper: section.querySelector(`.${selector}__foregrounds`),
      progress: section.querySelector(`.${selector}__progress`),
      skip: section.querySelector(`.${selector}__skip`),
    };

    // default options
    this.defaults = {};

    // merge default options with param options
    this.options = { ...this.defaults, ...options };

    // bind events
    this.events = bindEvents(this);

    // class variables

    this.bounds = {
      foregroundsWrapper: null,
    };

    this.coords = {
      scrollYPrev: 0,
    };

    this.dataMaps = {
      backgrounds: [],
    };

    this.flags = {
      isBackgroundsLocked: false,
      isIe: false,
      isMobileOpen: false,
      isSticky: false,
    };

    this.observers = {
      intersection: new IntersectionObserver(this.events._onObserverUpdate, {
        rootMargin: "0px",
        threshold: 0,
      }),
    };

    this.timeouts = {
      sticky: null,
    };

    // StorytellingBorder object
    this.border = null;

    // StorytellingBackground objects
    this.backgrounds = {
      all: [],
      active: null,
      prev: null,
    };

    // StorytellingForeground objects
    this.foregrounds = {
      all: [],
      active: null,
      prev: null,
      top: null,
      bottom: null,
    };

    if (!window.gsap) {
      gsap.registerPlugin(CSSPlugin, ScrollTrigger);
      window.gsap = gsap;
    }

    this.timeline = window.gsap
      .timeline({
        scrollTrigger: {
          trigger: this.el.section,
          start: "top bottom",
          scrub: true,
          end: "bottom bottom",
          // markers: true,
        },
      })
      .duration(this.getDuration());

    // StorytellingProgress object
    this.progress = new StorytellingProgress(this.el.progress, {
      controller: this,
    });

    // let's roll
    this.init();
  }

  addToTimeline(obj, position = null) {
    if (position) {
      this.timeline = this.timeline
        .duration(this.getDuration())
        .add(obj, position);
      return;
    }
    this.timeline = this.timeline.duration(this.getDuration()).add(obj);
  }

  getDuration() {
    return this.el.section.offsetHeight / window.innerHeight;
  }

  init() {
    this.configAnimationData();
    this.configBackgrounds();
    this.configForegrounds();
    this.addEventListeners();
  }

  _onResize() {
    if (this.timeline) {
      setTimeout(() => {
        this.timeline.duration(this.getDuration());
      }, 500);
    }
  }

  // move background data from attributes to datasets

  configAnimationData() {
    this.el.backgrounds.forEach(($background, index) => {
      // parse animation settings for each background

      const animationData = {};
      const configElement = $background.querySelector("figure");

      // animation position

      const animationPosition = configElement.getAttribute(
        "data-animation-origin"
      );
      if (animationPosition) {
        animationData.transformOrigin = animationPosition;
      }

      // animation start

      const animationStart = configElement.getAttribute("data-animation-start");

      if (animationStart) {
        const animationStartSplit = animationStart.trim().split(";");
        animationData.start = {};

        for (let i = 0; i < animationStartSplit.length; i += 1) {
          const startValue = animationStartSplit[i].trim();
          const valueSplit = startValue.split(":");
          if (valueSplit.length > 1) {
            animationData.start[valueSplit[0].trim()] = valueSplit[1].trim();
          }
        }

        if (animationData.start.transform) {
          animationData.start = {
            ...animationData.start,
            ...parseTransform(animationData.start.transform),
          };

          if (animationData.start.translateX) {
            animationData.start.x = animationData.start.translateX;
          }

          if (animationData.start.translateY) {
            animationData.start.y = animationData.start.translateY;
          }

          delete animationData.start.transform;
        }
      }

      // animation end

      const animationEnd = configElement.getAttribute("data-animation-end");

      if (animationEnd) {
        const animationEndSplit = animationEnd.trim().split(";");
        animationData.end = {};

        for (let i = 0; i < animationEndSplit.length; i += 1) {
          const endValue = animationEndSplit[i].trim();
          const valueSplit = endValue.split(":");
          if (valueSplit.length > 1) {
            animationData.end[valueSplit[0].trim()] = valueSplit[1].trim();
          }
        }

        if (animationData.end.transform) {
          animationData.end = {
            ...animationData.end,
            ...parseTransform(animationData.end.transform),
          };

          if (animationData.end.translateX) {
            animationData.end.x = animationData.end.translateX;
          }

          if (animationData.end.translateY) {
            animationData.end.y = animationData.end.translateY;
          }

          delete animationData.end.transform;
        }
      }

      this.dataMaps.backgrounds[index] = animationData;
    });
  }

  // create background and foreground objects

  configBackgrounds() {
    // create background objects
    for (let i = 0; i < this.el.backgrounds.length; i += 1) {
      const $background = this.el.backgrounds[i];
      const background = new StorytellingBackground($background, {
        controller: this,
        animationData: this.dataMaps.backgrounds[i],
        index: i,
        foregrounds: this.foregrounds,
      });
      if (i === 0) {
        background.setActive();
      }
      this.backgrounds.all.push(background);
    }

    // organize all valid backgrounds
    this.el.backgroundsWithContent = [];
    for (let i = 0; i < this.el.backgrounds.length; i += 1) {
      const $background = this.el.backgrounds[i];
      if ($background.getAttribute("data-has-background") !== "false") {
        this.el.backgroundsWithContent.push($background);
      }
    }
  }

  configForegrounds() {
    for (let i = 0; i < this.el.foregrounds.length; i += 1) {
      const $foreground = this.el.foregrounds[i];
      const foreground = new StorytellingForeground($foreground, {
        controller: this,
        index: i,
        backgrounds: this.backgrounds,
      });
      this.foregrounds.all.push(foreground);
    }

    this.border = new StorytellingBorder(this.el.border, {
      controller: this,
      foregrounds: {
        top: this.foregrounds.all[0],
        bottom: this.foregrounds.all[this.foregrounds.all.length - 1],
      },
    });
  }

  // event listeners

  addEventListeners() {
    if (this.el.skip) {
      this.el.skip.addEventListener("click", this.events._onSkipClick);
    }

    this.el.foregrounds.forEach(($target) => {
      this.observers.intersection.observe($target);
    });

    window.addEventListener("resize", this.events._onResize);
  }

  removeEventListeners() {
    if (this.el.skip) {
      this.el.skip.removeEventListener("click", this.events._onSkipClick);
    }

    this.el.foregrounds.forEach(($target) => {
      this.observers.intersection.unobserve($target);
    });

    window.removeEventListener("resize", this.events._onResize);
  }

  _onSkipClick() {
    const skipScrollY = getOffsetBounds(this.el.section).scrollBottom - 100;
    window.scrollTo({
      top: skipScrollY,
      behavior: "smooth",
    });
  }

  _onObserverUpdate(entries) {
    let backgroundIndex = -1;
    let isBackgroundChange = false;
    let isIntersecting = false;
    let backgroundEntry = null;

    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];

      if (entry.isIntersecting) {
        this.foregrounds.prev = this.foregrounds.active;
        this.foregrounds.active = this.getForegroundByElement(entry.target);

        backgroundIndex = this.foregrounds.active.index;
        backgroundEntry = entry;

        isBackgroundChange = true;
        isIntersecting = true;
        const currentBg = this.el.backgrounds[backgroundIndex];

        [entry.target, currentBg]
          .filter((section) => typeof section !== "undefined" && !!section)
          .forEach(async (section) => {
            const video = section.querySelector("video");
            let addAutoPlay = false;
            if (video) {
              try {
                if (video.readyState > 1) {
                  await video.play();
                } else {
                  addAutoPlay = true;
                }
              } catch (e) {
                addAutoPlay = true;
                console.error(e);
              }

              if (addAutoPlay) {
                video.addEventListener("canplay", () => {
                  video.play();
                });
              }
            }
          });
      } else {
        const index = getElementIndex(entry.target, this.el.foregrounds);

        const otherBg = this.el.backgrounds[index];

        [entry.target, otherBg]
          .filter((section) => typeof section !== "undefined" && !!section)
          .forEach((section) => {
            const video = section.querySelector("video");
            if (video) {
              try {
                video.pause();
              } catch (e) {
                console.error(e);
              }
            }
          });
      }
    }

    if (!isIntersecting) {
      this.foregrounds.prev = this.foregrounds.active;
      this.foregrounds.active = null;
    }

    if (isBackgroundChange && backgroundIndex >= 0) {
      // set background
      let $background = this.el.backgrounds[backgroundIndex];

      // background frames could be left blank in config - must revert to last frame with a background
      while (
        $background.getAttribute("data-has-background") === "false" &&
        backgroundIndex >= 0
      ) {
        backgroundIndex -= 1;
        if (backgroundIndex >= 0) {
          $background = this.el.backgrounds[backgroundIndex];
        } else {
          [$background] = this.el.backgroundsWithContent;
          backgroundIndex = getElementIndex($background, this.el.backgrounds);
          break;
        }
      }

      const backgroundPos = this.el.backgroundsWithContent.indexOf($background);

      // set prev background
      if (backgroundEntry.intersectionRect.top === 0) {
        // scrolling up
        if (backgroundPos < this.el.backgroundsWithContent.length - 1) {
          this.backgrounds.prev = this.getBackgroundByElement(
            this.el.backgroundsWithContent[backgroundPos + 1]
          );
          this.backgrounds.prev.setPrev();
        } else {
          this.backgrounds.prev = null;
        }
        // scrolling down
      } else if (backgroundPos > 0) {
        this.backgrounds.prev = this.getBackgroundByElement(
          this.el.backgroundsWithContent[backgroundPos - 1]
        );
        this.backgrounds.prev.setPrev();
      } else {
        this.backgrounds.prev = null;
      }

      // set active background
      this.backgrounds.active = this.getBackgroundByElement($background);

      // check if active background exists
      if (this.backgrounds.active) {
        this.backgrounds.active.setActive();
      }

      // clear inactive backgrounds
      for (let i = 0; i < this.backgrounds.length; i += 1) {
        const background = this.backgrounds.all[i];
        if (
          background !== this.backgrounds.active &&
          background !== this.backgrounds.prev
        ) {
          background.setInactive();
        }
      }

      // save top to bottom expanse of background for foreground triggers
      let foregroundTopIndex = getElementIndex(
        this.el.backgroundsWithContent[backgroundPos]
      );
      const lowerBackgroundPos =
        backgroundPos < this.el.backgroundsWithContent.length - 1
          ? backgroundPos + 1
          : backgroundPos;
      const nextBackgroundIndex = getElementIndex(
        this.el.backgroundsWithContent[lowerBackgroundPos],
        this.el.backgrounds
      );
      let foregroundBottomIndex =
        foregroundTopIndex >= this.backgrounds.all.length - 1
          ? foregroundTopIndex
          : nextBackgroundIndex - 1;

      if (this.el.backgroundsWithContent.length === 1) {
        foregroundTopIndex = 0;
        foregroundBottomIndex = this.foregrounds.all.length - 1;
      } else if (foregroundTopIndex >= foregroundBottomIndex) {
        foregroundTopIndex = Math.max(0, foregroundBottomIndex - 1);
      }

      this.foregrounds.top = this.foregrounds.all[foregroundTopIndex];
      this.foregrounds.bottom = this.foregrounds.all[foregroundBottomIndex];

      // set foreground states
      this.foregrounds.active.setActive();
      this.foregrounds.top.setTop();
      this.foregrounds.bottom.setBottom();

      if (this.foregrounds.prev) {
        this.foregrounds.prev.setPrev();
      }

      // set active background boundary foregrounds if exists
      if (this.backgrounds.active) {
        this.backgrounds.active.setBoundaryForegrounds(
          this.foregrounds.top,
          this.foregrounds.bottom
        );
      }
    }
  }

  // get foreground and background objects by dom elements

  getForegroundByElement($target) {
    for (let i = 0; i < this.foregrounds.all.length; i += 1) {
      const foreground = this.foregrounds.all[i];
      if (foreground.section === $target) {
        return foreground;
      }
    }
    return null;
  }

  getBackgroundByElement($target) {
    for (let i = 0; i < this.backgrounds.all.length; i += 1) {
      const background = this.backgrounds.all[i];
      if (background.section === $target) {
        return background;
      }
    }
    return null;
  }

  // rip it

  destroy() {
    for (let i = 0; i < this.backgrounds.length; i += 1) {
      this.backgrounds[i].destroy();
    }

    this.removeEventListeners();
  }
}

const section = document.querySelector(".storytelling");
const storytellingScroller = new StorytellingScroller(section, {
  /* options */
});
