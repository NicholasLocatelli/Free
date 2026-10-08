import { Redirect } from "expo-router";
import { CatalogScreen } from "../../src/features/catalog/CatalogScreen";

/** Developer-only component catalogue; unreachable in release builds. */
export default function Catalog() {
  if (!__DEV__) return <Redirect href="/" />;
  return <CatalogScreen />;
}
