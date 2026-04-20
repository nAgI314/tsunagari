import { EventPage } from "@/features/event/pages/EventPage";
import { EventResultsPage } from "@/features/event/pages/EventResultsPage";
import { SchedulerPage } from "@/features/scheduler/pages/SchedulerPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function App() {
  const pathname = window.location.pathname;
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const eventResultsMatch = normalizedPath.match(/^\/event\/([^/]+)\/results$/);
  const eventMatch = normalizedPath.match(/^\/event\/([^/]+)$/);

  if (normalizedPath === "/") {
    return <SchedulerPage />;
  }

  if (eventResultsMatch) {
    return <EventResultsPage linkId={decodeURIComponent(eventResultsMatch[1])} />;
  }

  if (eventMatch) {
    return <EventPage linkId={decodeURIComponent(eventMatch[1])} />;
  }

  return <NotFoundPage />;
}

export default App;
