import { EventPage } from "@/features/event/pages/EventPage";
import { SchedulerPage } from "@/features/scheduler/pages/SchedulerPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function App() {
  const pathname = window.location.pathname;
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const eventMatch = normalizedPath.match(/^\/event\/([^/]+)$/);

  if (normalizedPath === "/") {
    return <SchedulerPage />;
  }

  if (eventMatch) {
    return <EventPage linkId={decodeURIComponent(eventMatch[1])} />;
  }

  return <NotFoundPage />;
}

export default App;
