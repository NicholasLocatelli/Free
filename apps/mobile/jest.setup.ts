// Safe-area insets come from native code; the library ships an official Jest mock.
jest.mock(
  "react-native-safe-area-context",
  () =>
    jest.requireActual<{ default: unknown }>("react-native-safe-area-context/jest/mock").default,
);

// Expo installs some web globals lazily (URL, structuredClone, ...). In the `node` test
// environment Jest reads globals during teardown, which would trigger those lazy `require`s
// outside the test scope; resolving them up front avoids that.
for (const name of [
  "TextDecoderStream",
  "TextEncoderStream",
  "URL",
  "URLSearchParams",
  "DOMException",
  "__ExpoImportMetaRegistry",
  "structuredClone",
  "fetch",
]) {
  Reflect.get(globalThis, name);
}
