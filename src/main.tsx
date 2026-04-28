import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { SimulationProvider } from "@/hooks/useSimulation";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <SimulationProvider>
      <App />
    </SimulationProvider>
  </BrowserRouter>,
);
