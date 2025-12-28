import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import Application from "./application";
import { CartProvider } from "@/contexts/cart-context";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <div data-testid="main-container" className="main-container">
        <BrowserRouter>
          <CartProvider>
            <Application />
          </CartProvider>
        </BrowserRouter>
      </div>
    </StrictMode>,
  );
} else {
  console.error("Root element not found");
}
