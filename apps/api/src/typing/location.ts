export interface IRoute {
  distance: number;
  duration: number;
  geometry: string;
}

export interface ILocation {
  code: string;
  routes: Route[];
  waypoints: Waypoint[];
}

export interface ILocalization {
  latitude: number;
  longitude: number;
}

export interface Route {
  geometry: string;
  legs: Leg[];
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
}

export interface Leg {
  steps: Step[];
  summary: string;
  weight: number;
  duration: number;
  distance: number;
}

export interface Step {
  geometry: string;
  maneuver: Maneuver;
  mode: string;
  driving_side: string;
  name: string;
  intersections: Intersection[];
  weight: number;
  duration: number;
  distance: number;
  ref?: string;
  rotary_name?: string;
}

export interface Maneuver {
  bearing_after: number;
  bearing_before: number;
  location: number[];
  modifier?: string;
  type: string;
  exit?: number;
}

export interface Intersection {
  out?: number;
  entry: boolean[];
  bearings: number[];
  location: number[];
  in?: number;
  lanes?: Lane[];
  classes?: string[];
}

export interface Lane {
  valid: boolean;
  indications: string[];
}

export interface Waypoint {
  hint: string;
  distance: number;
  name: string;
  location: number[];
}

export interface ReverseResponse {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  class: string;
  type: string;
  importance: number;
}

export interface IRoute {
  distance: number;
  duration: number;
  geometry: string;
}
