import AppV1 from "./App";
import V2App from "./V2App";
import V3App from "./V3App";

export default function Root() {
  const version = new URLSearchParams(window.location.search).get("v");
  if (version === "1") return <AppV1 />;
  if (version === "3") return <V3App />;
  if (version === "3.1") return <V3App edition="3.1" />;
  return <V2App version={version === "2.2" ? "2.2" : "2.1"} />;
}
