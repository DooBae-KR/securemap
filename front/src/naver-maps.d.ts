declare namespace naver.maps {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

 class Map {
  constructor(element: HTMLElement, options: MapOptions);

  morph(position: LatLng): void;
  panTo(position: LatLng): void;
  setZoom(zoom: number): void;
}

  class Marker {
    constructor(options: MarkerOptions);
    getPosition(): LatLng;
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    setContent(content: string): void;
    open(map: Map, anchor: Marker): void;
    close(): void;
  }

  const Event: {
    addListener(target: Marker, eventName: string, handler: () => void): void;
  };

  interface MapOptions {
    center: LatLng;
    zoom: number;
  }

  interface MarkerOptions {
    position: LatLng;
    map: Map;
    title: string;
  }

  interface InfoWindowOptions {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    anchorSize?: Size;
    pixelOffset?: Point;
  }
}

interface Window {
  naver: typeof naver;
}