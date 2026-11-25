import { createRoot } from "react-dom/client";

import "@/init.tsx";
import App from "@/app.tsx";


createRoot(document.getElementById("root")!).render(<App />);
