export const selector = "storytelling-scroller";

export default class StorytellingScroller {
  constructor(section, options) {
    return import("./script").then(
      ({ default: AsyncComponent }) => new AsyncComponent(section, options)
    );
  }
}
