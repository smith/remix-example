import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { init as initApm } from "@elastic/apm-rum";
initApm(__remixContext.routeData.root.elasticApmRumAgentConfig);
console.log("wat");
hydrate(<RemixBrowser />, document);
