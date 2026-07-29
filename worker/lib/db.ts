export function createDb(env: { DB: D1Database }) {
  function build(strings: TemplateStringsArray, ...values: unknown[]) {
    let text = '';
    const bindings: unknown[] = [];
    strings.forEach((str, i) => {
      text += str;
      if (i < values.length) {
        bindings.push(values[i]);
        text += '?';
      }
    });
    return { text, bindings };
  }

  return {
    sql(strings: TemplateStringsArray, ...values: unknown[]) {
      const { text, bindings } = build(strings, ...values);
      return {
        run: () => env.DB.prepare(text).bind(...bindings).run(),
        all: <T = Record<string, unknown>>() => env.DB.prepare(text).bind(...bindings).all<T>(),
        first: <T = Record<string, unknown>>() => env.DB.prepare(text).bind(...bindings).first<T>(),
      };
    },
  };
}
