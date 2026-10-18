import type { DeviceAuth } from "../platform/deviceAuth";

/** Simulated phone screen lock: whether one is set up and whether the owner passes it. */
export function createFakeDeviceAuth({ available = true, passes = true } = {}) {
  const state = { prompts: 0, protection: false, passes };
  const auth: DeviceAuth = {
    isAvailable: () => Promise.resolve(available),
    authenticate: () => {
      state.prompts++;
      return Promise.resolve(state.passes);
    },
    setScreenProtection: (on) => {
      state.protection = on;
      return Promise.resolve();
    },
  };
  return { auth, state };
}
