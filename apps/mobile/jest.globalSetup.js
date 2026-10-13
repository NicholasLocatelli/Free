// Fixed timezone for deterministic date tests on every OS (Windows has no `TZ=` prefix).
// Set before Jest spawns workers, which inherit the environment.
module.exports = () => {
  process.env.TZ = "Europe/Rome";
};
