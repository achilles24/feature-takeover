export default function (cl, prefix = "_on") {
  const events = {};
  const methods = Reflect.ownKeys(Reflect.getPrototypeOf(cl));
  methods.forEach((m) => {
    if (m.indexOf(prefix) === 0) events[m] = cl[m].bind(cl);
  });
  return events;
}
