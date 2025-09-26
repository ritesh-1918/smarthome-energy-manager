import { feature, product, priceItem, featureItem, pricedFeatureItem } from "atmn";

export const telemetryPoints = feature({
  id: "telemetry_points",
  name: "Telemetry Points",
  type: "single_use",
});

export const advisorMessages = feature({
  id: "advisor_messages", 
  name: "AI Advisor Messages",
  type: "single_use",
});

export const planners = feature({
  id: "planners",
  name: "Active Planners",
  type: "continuous_use",
});

export const free = product({
  id: "free",
  name: "Free",
  is_default: true,
  items: [
    featureItem({
      feature_id: telemetryPoints.id,
      included_usage: 3000,
      interval: "month",
    }),
    featureItem({
      feature_id: advisorMessages.id,
      included_usage: 30,
      interval: "month",
    }),
    featureItem({
      feature_id: planners.id,
      included_usage: 1,
    }),
  ],
});

export const pro = product({
  id: "pro",
  name: "Pro",
  items: [
    priceItem({
      price: 12,
      interval: "month",
    }),
    featureItem({
      feature_id: telemetryPoints.id,
      included_usage: 300000,
      interval: "month",
    }),
    featureItem({
      feature_id: advisorMessages.id,
      included_usage: 1000,
      interval: "month",
    }),
    featureItem({
      feature_id: planners.id,
      included_usage: 10,
    }),
  ],
});