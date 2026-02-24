import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API_KEY = "07ec2024-4635-4a71-9c14-d189c541e80a";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  type: "seo" | "ai-visibility" | "ai-bot" | "loading-speed";
  website: string;
}

async function analyzeSeo(website: string) {
  const response = await fetch(
    `https://vebapi.com/api/seo/analyze/v2?website=${encodeURIComponent(website)}`,
    {
      headers: { "X-API-KEY": API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`SEO Analysis failed: ${response.statusText}`);
  }

  return response.json();
}

async function checkAiVisibility(website: string) {
  const response = await fetch(
    `https://vebapi.com/api/seo/ai-visibility-checker/v2?website=${encodeURIComponent(website)}`,
    {
      headers: { "X-API-KEY": API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`AI Visibility check failed: ${response.statusText}`);
  }

  return response.json();
}

async function checkAiBots(website: string) {
  const response = await fetch(
    `https://vebapi.com/api/seo/aiseochecker?website=${encodeURIComponent(website)}`,
    {
      headers: { "X-API-KEY": API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`AI Bot check failed: ${response.statusText}`);
  }

  return response.json();
}

async function checkLoadingSpeed(website: string) {
  const response = await fetch(
    `https://vebapi.com/api/seo/loadingspeeddata/v2?website=${encodeURIComponent(website)}`,
    {
      headers: { "X-API-KEY": API_KEY },
    }
  );

  if (!response.ok) {
    throw new Error(`Loading Speed check failed: ${response.statusText}`);
  }

  return response.json();
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { type, website } = (await req.json()) as AnalysisRequest;

    if (!type || !website) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type and website" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;

    switch (type) {
      case "seo":
        result = await analyzeSeo(website);
        break;
      case "ai-visibility":
        result = await checkAiVisibility(website);
        break;
      case "ai-bot":
        result = await checkAiBots(website);
        break;
      case "loading-speed":
        result = await checkLoadingSpeed(website);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid analysis type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
