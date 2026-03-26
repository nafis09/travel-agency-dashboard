import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/assets/icons/favicon.svg", type: "image/svg+xml" },
];

import { registerLicense } from "@syncfusion/ej2-base";

const syncfusionKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY;
if (typeof syncfusionKey === "string" && syncfusionKey.trim().length > 0) {
  registerLicense(syncfusionKey);
}


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";

    if (error.status === 404) {
      details = "The requested page could not be found.";
    } else if (typeof error.data === "string" && error.data.trim().length > 0) {
      // When loaders/actions throw `new Response("...")`, the message is usually in `data`.
      details = error.data;
    } else if (error.data != null) {
      try {
        details = JSON.stringify(error.data);
      } catch {
        details = String(error.data);
      }
    } else if (error.statusText) {
      details = error.statusText;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
