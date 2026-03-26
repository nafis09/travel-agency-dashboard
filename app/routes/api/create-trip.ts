import { type ActionFunctionArgs, data } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ID } from "appwrite";

import { appwriteServerConfig, serverDatabase } from "~/appwrite/server";
import { parseMarkdownToJson } from "~/lib/utils";

type CreateTripBody = {
  country: string;
  numberOfDays: number;
  travelStyle: string;
  interests: string;
  budget: string;
  groupType: string;
  userId: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const isDev = process.env.NODE_ENV !== "production";

  let body: CreateTripBody;
  try {
    body = (await request.json()) as CreateTripBody;
  } catch {
    return data({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId,
  } = body ?? ({} as any);

  if (
    typeof country !== "string" ||
    typeof travelStyle !== "string" ||
    typeof interests !== "string" ||
    typeof budget !== "string" ||
    typeof groupType !== "string" ||
    typeof userId !== "string" ||
    typeof numberOfDays !== "number" ||
    !Number.isFinite(numberOfDays)
  ) {
    return data({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!geminiApiKey || !unsplashApiKey) {
    return data({ error: "Server missing API configuration" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);

  try {
    const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
Budget: '${budget}'
Interests: '${interests}'
TravelStyle: '${travelStyle}'
GroupType: '${groupType}'

Return ONLY valid JSON (no markdown fences). Use double quotes for all keys/strings and no trailing commas. Use this structure:
{
  "name": "A descriptive title for the trip",
  "description": "A brief description of the trip and its highlights not exceeding 100 words",
  "estimatedPrice": "Lowest average price for the trip in USD, e.g. $price",
  "duration": ${numberOfDays},
  "budget": "${budget}",
  "travelStyle": "${travelStyle}",
  "country": "${country}",
  "interests": "${interests}",
  "groupType": "${groupType}",
  "bestTimeToVisit": [
    "Spring (from month to month): reason to visit",
    "Summer (from month to month): reason to visit",
    "Autumn (from month to month): reason to visit",
    "Winter (from month to month): reason to visit"
  ],
  "weatherInfo": [
    "Spring: temperature range in Celsius (temperature range in Fahrenheit)",
    "Summer: temperature range in Celsius (temperature range in Fahrenheit)",
    "Autumn: temperature range in Celsius (temperature range in Fahrenheit)",
    "Winter: temperature range in Celsius (temperature range in Fahrenheit)"
  ],
  "location": {
    "city": "name of the city or region",
    "coordinates": [latitude, longitude],
    "openStreetMap": "link to open street map"
  },
  "itinerary": [
    {
      "day": 1,
      "location": "City/Region Name",
      "activities": [
        { "time": "Morning", "description": "Visit a historic site and enjoy a scenic walk" },
        { "time": "Afternoon", "description": "Explore a museum or cultural district with a guided tour" },
        { "time": "Evening", "description": "Dine at a well-reviewed local restaurant" }
      ]
    }
  ]
}`;

    let warning: string | undefined;
    let trip: unknown | null = null;

    const buildFallbackTrip = (warningMessage: string) => {
      warning = warningMessage;

      const estimateFromBudget = (b: string) => {
        const v = b.toLowerCase();
        if (v.includes("low")) return "$700";
        if (v.includes("mid")) return "$1500";
        if (v.includes("high") || v.includes("lux")) return "$3000";
        return "$1200";
      };

      trip = {
        name: `${numberOfDays}-Day Trip to ${country}`,
        description: `A ${numberOfDays}-day ${travelStyle} itinerary in ${country} focused on ${interests}.`,
        estimatedPrice: estimateFromBudget(budget),
        duration: numberOfDays,
        budget,
        travelStyle,
        country,
        interests,
        groupType,
        bestTimeToVisit: [
          "Spring (Mar-May): mild weather and fewer crowds",
          "Summer (Jun-Aug): festivals and long daylight hours",
          "Autumn (Sep-Nov): pleasant temperatures and fall colors",
          "Winter (Dec-Feb): quieter season with lower prices",
        ],
        weatherInfo: [
          "Spring: mild temperatures",
          "Summer: warm to hot temperatures",
          "Autumn: cool to mild temperatures",
          "Winter: cold to cool temperatures",
        ],
        location: {
          city: country,
          coordinates: [0, 0],
          openStreetMap: "",
        },
        itinerary: Array.from({ length: numberOfDays }, (_, i) => ({
          day: i + 1,
          location: country,
          activities: [
            { time: "Morning", description: "Explore a landmark area and take a walking tour." },
            { time: "Afternoon", description: "Visit a museum/market and try local food." },
            { time: "Evening", description: "Relax with a scenic viewpoint and dinner." },
          ],
        })),
      };
    };

    let textResult: Awaited<
      ReturnType<ReturnType<typeof genAI.getGenerativeModel>["generateContent"]>
    > | null = null;
    try {
      textResult = await genAI
        .getGenerativeModel({ model: "gemini-2.0-flash" })
        .generateContent([prompt]);
    } catch (e: any) {
      const message = e?.message ? String(e.message) : "Gemini request failed";

      // Bubble up rate limit/quota errors as 429 so the client can retry/back off.
      if (message.includes("[429") || message.includes("Too Many Requests")) {
        const retryDelayMatch =
          message.match(/retryDelay\":\"(\\d+)s\"/) ??
          message.match(/Please retry in\\s+([0-9.]+)s/i);

        const retryAfterSeconds = retryDelayMatch
          ? Math.max(1, Math.ceil(Number(retryDelayMatch[1])))
          : undefined;

        // Fallback: generate a simple itinerary locally so the app still functions without Gemini quota.
        buildFallbackTrip(
          retryAfterSeconds
            ? `Gemini quota/rate limit exceeded. Used fallback itinerary. Retry Gemini after ~${retryAfterSeconds}s.`
            : "Gemini quota/rate limit exceeded. Used fallback itinerary.",
        );
      } else if (
        message.includes("[403") ||
        message.includes("403 Forbidden") ||
        message.toLowerCase().includes("forbidden")
      ) {
        // Common in dev when the key is invalid/revoked or reported leaked. Keep the app usable.
        buildFallbackTrip(
          "Gemini rejected the API key (403). Used fallback itinerary. Rotate GEMINI_API_KEY and restart the dev server.",
        );
      } else {
        return data(
          { error: message, ...(isDev ? { stage: "gemini" } : {}) },
          { status: 502 },
        );
      }
    }

    if (!trip) {
      if (!textResult) {
        return data(
          { error: "Gemini response missing", ...(isDev ? { stage: "gemini" } : {}) },
          { status: 502 },
        );
      }

      trip = parseMarkdownToJson(textResult.response.text());
      if (!trip) {
        return data(
          {
            error: "Failed to parse itinerary JSON from Gemini response",
            ...(isDev ? { stage: "gemini" } : {}),
          },
          { status: 502 },
        );
      }
    }

    let imageResponse: Response;
    try {
      imageResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`,
      );
    } catch (e: any) {
      const message = e?.message ? String(e.message) : "Unsplash request failed";
      return data(
        { error: message, ...(isDev ? { stage: "unsplash" } : {}) },
        { status: 502 },
      );
    }

    if (!imageResponse.ok) {
      return data(
        {
          error: `Unsplash request failed (${imageResponse.status})`,
          ...(isDev ? { stage: "unsplash" } : {}),
        },
        { status: 502 },
      );
    }

    const imageJson = await imageResponse.json();
    const imageUrls = (imageJson?.results ?? [])
      .slice(0, 3)
      .map((result: any) => result?.urls?.regular || null);

    let result: any;
    try {
      const baseDoc = {
        tripDetail: JSON.stringify(trip),
        createdAt: new Date().toISOString(),
        imageUrls,
      };

      // Appwrite collection schemas vary; try common attribute names for the user reference.
      const userFieldVariants: Array<Record<string, string>> = [
        { accountId: userId },
        { user: userId },
        { user_id: userId },
        { createdBy: userId },
        { ownerId: userId },
        { userId },
        {}, // last resort: store without user linkage if the schema doesn't include a user field
      ];

      let lastErr: any = null;
      for (const extra of userFieldVariants) {
        try {
          result = await serverDatabase.createDocument(
            appwriteServerConfig.databaseId,
            appwriteServerConfig.tripCollectionId,
            ID.unique(),
            { ...baseDoc, ...extra },
          );
          lastErr = null;
          break;
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (lastErr) throw lastErr;
    } catch (e: any) {
      const message = e?.message ? String(e.message) : "Appwrite request failed";
      return data(
        {
          error: message,
          ...(isDev ? { stage: "appwrite", code: e?.code, type: e?.type } : {}),
        },
        { status: 502 },
      );
    }

    return data(warning ? { id: result.$id, warning } : { id: result.$id });
  } catch (e) {
    const message = (e as any)?.message ? String((e as any).message) : null;
    return data(
      {
        error: "Error generating travel plan",
        ...(isDev && message ? { details: message } : {}),
      },
      { status: 500 },
    );
  }
};
