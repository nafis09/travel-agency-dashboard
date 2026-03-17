import { Client, Databases } from "appwrite";

type AppwriteServerConfig = {
  endpointUrl: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  tripCollectionId: string;
};

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

// Server-only Appwrite client.
// Uses an API key so we don't depend on a browser session cookie.
export const appwriteServerConfig: AppwriteServerConfig = {
  endpointUrl:
    process.env.APPWRITE_API_ENDPOINT ??
    requiredEnv("VITE_APPWRITE_API_ENDPOINT"),
  projectId:
    process.env.APPWRITE_PROJECT_ID ?? requiredEnv("VITE_APPWRITE_PROJECT_ID"),
  apiKey: process.env.APPWRITE_API_KEY ?? requiredEnv("VITE_APPWRITE_API_KEY"),
  databaseId:
    process.env.APPWRITE_DATABASE_ID ?? requiredEnv("VITE_APPWRITE_DATABASE_ID"),
  tripCollectionId:
    process.env.APPWRITE_TRIPS_COLLECTION_ID ??
    requiredEnv("VITE_APPWRITE_TRIPS_COLLECTION_ID"),
};

const serverClient = new Client()
  .setEndpoint(appwriteServerConfig.endpointUrl)
  .setProject(appwriteServerConfig.projectId)
  .setDevKey(appwriteServerConfig.apiKey);

export const serverDatabase = new Databases(serverClient);
