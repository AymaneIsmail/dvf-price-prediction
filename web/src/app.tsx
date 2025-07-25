import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InteractiveMap } from "./components/interactive-map";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InteractiveMap />
    </QueryClientProvider>
  );
}
