import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InteractiveMap } from "./components/interactive-map";
import PricePredictionForm from "./components/price-prediction-form";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <InteractiveMap /> */}

      <PricePredictionForm />
    </QueryClientProvider>
  );
}
