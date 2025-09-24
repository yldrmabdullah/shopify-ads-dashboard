import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { fetchMetrics } from "../services/connections.server.js";
export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    
    if (!session?.shop) {
      return json({
        error: "Invalid session",
        keyMetrics: [],
        campaigns: [],
        accountInfo: {},
        isTestData: true
      }, { status: 200 });
    }
    
    const formData = await request.formData();
    const { isTestMode } = await import("../config/app.server.js");
    const platform = formData.get("platform");
    const dateRangeString = formData.get("dateRange");
    
    if (!platform) {
      return json({
        error: "Platform is required",
        keyMetrics: [],
        campaigns: [],
        accountInfo: {},
        isTestData: true
      }, { status: 200 });
    }
    
    let dateRange;
    try {
      dateRange = dateRangeString ? JSON.parse(dateRangeString) : null;
    } catch (e) {
      console.warn("Invalid date range format:", e);
      dateRange = null;
    }
    
    const metrics = await fetchMetrics(platform, dateRange, session.shop);
    
    if (!metrics) {
      return json({
        error: "No metrics available",
        keyMetrics: [],
        campaigns: [],
        accountInfo: {},
        isTestData: true
      }, { status: 200 });
    }
    
    return json({
      ...metrics,
      isTestMode: isTestMode(),
      platform,
      dateRange
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in metrics API:", error);
    return json({ 
      error: "Failed to fetch metrics",
      keyMetrics: [],
      campaigns: [],
      accountInfo: {},
      isTestData: true
    }, { status: 200 });
  }
};

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    
    if (!session?.shop) {
      return json({
        error: "Invalid session",
        keyMetrics: [],
        campaigns: [],
        accountInfo: {},
        isTestData: true
      }, { status: 200 });
    }
    
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform");
    const dateRangeString = url.searchParams.get("dateRange");
    
    if (!platform) {
      return json({
        error: "Platform is required",
        keyMetrics: [],
        campaigns: [],
        accountInfo: {},
        isTestData: true
      }, { status: 200 });
    }
    
    let dateRange;
    try {
      dateRange = dateRangeString ? JSON.parse(dateRangeString) : null;
    } catch (e) {
      console.warn("Invalid date range format:", e);
      dateRange = null;
    }
    
    const metrics = await fetchMetrics(platform, dateRange, session.shop);
    
    if (!metrics) {
      return json({
        error: "No metrics available",
        keyMetrics: [],
        campaigns: [],
        accountInfo: {},
        isTestData: true
      }, { status: 200 });
    }
    
    return json({
      ...metrics,
      isTestMode: isTestMode(),
      platform,
      dateRange
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in metrics loader:", error);
    return json({ 
      error: "Failed to fetch metrics",
      keyMetrics: [],
      campaigns: [],
      accountInfo: {},
      isTestData: true
    }, { status: 200 });
  }
};
