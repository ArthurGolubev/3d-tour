import { MapConfig } from '../data/tour-config';

export class MapManager {
  private container: HTMLElement;
  private mapContent: HTMLElement;
  private onMarkerClick: (nodeId: string) => void;


  private radarElement: HTMLElement | null = null;

  private currentMapConfig: MapConfig | null = null;
  private currentRotationOffset: number = 0;

  constructor(containerId: string, onMarkerClick: (nodeId: string) => void) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Map container #${containerId} not found`);
    
    this.container = container;
    this.mapContent = container.querySelector('.map-content') as HTMLElement;
    this.onMarkerClick = onMarkerClick;
  }

  public setMap(config: MapConfig) {
    this.currentMapConfig = config;
    this.mapContent.innerHTML = ''; // Clear existing content
    this.radarElement = null;
    this.currentRotationOffset = 0;
    
    // Toggle horizontal class
    if (config.horizontal) {
      this.container.classList.add('is-horizontal');
    } else {
      this.container.classList.remove('is-horizontal');
    }
    
    // Create map wrapper for relative positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'map-wrapper';
    
    // Map Image
    const img = document.createElement('img');
    img.src = config.imageUrl;
    img.alt = 'Map';
    img.className = 'map-image';
    wrapper.appendChild(img);

    // Create Radar Element (hidden initially)
    this.radarElement = document.createElement('div');
    this.radarElement.className = 'map-radar hidden';
    this.radarElement.innerHTML = `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="radar-grad" x1="50" y1="50" x2="50" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.36" />
          </linearGradient>
        </defs>
        <!-- 90 degree cone, Radius ~48, Center 50,50. Fits inside 100x100 without clipping -->
        <path d="M50 50 L16 16 A 48 48 0 0 1 84 16 Z" fill="url(#radar-grad)" stroke="#504A47" stroke-width="1.18" />
      </svg>
    `;
    wrapper.appendChild(this.radarElement);

    // Markers
    config.markers.forEach(marker => {
      const markerEl = document.createElement('div');
      markerEl.className = 'map-marker';
      markerEl.setAttribute('data-node-id', marker.nodeId);
      markerEl.style.setProperty('--x-expanded', `${marker.x}%`);
      markerEl.style.setProperty('--y-expanded', `${marker.y}%`);
      markerEl.style.setProperty('--x-min', `${marker.minimizedX ?? marker.x}%`);
      markerEl.style.setProperty('--y-min', `${marker.minimizedY ?? marker.y}%`);
      // Default to minimized state
      // markerEl.style.left = `${marker.x}%`; 
      // markerEl.style.top = `${marker.y}%`;
      markerEl.title = marker.nodeId;
      
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onMarkerClick(marker.nodeId);
      });

      wrapper.appendChild(markerEl);
    });

    this.mapContent.appendChild(wrapper);
  }

  public setActiveMarker(nodeId: string) {
    this.lastRawYaw = null;
    
    // Update marker styles
    const markers = this.container.querySelectorAll('.map-marker');
    let markerFound = false;

    // Find rotation offset for this marker
    if (this.currentMapConfig) {
      const markerConfig = this.currentMapConfig.markers.find(m => m.nodeId === nodeId);
      this.currentRotationOffset = markerConfig?.rotationOffset || 0;
    }

    markers.forEach(m => {
      if (m.getAttribute('data-node-id') === nodeId) {
        m.classList.add('active');
        markerFound = true;
        
          // Move radar to this marker
          if (this.radarElement) {
            const el = m as HTMLElement;
            this.radarElement.style.setProperty('--x-expanded', el.style.getPropertyValue('--x-expanded'));
            this.radarElement.style.setProperty('--y-expanded', el.style.getPropertyValue('--y-expanded'));
            this.radarElement.style.setProperty('--x-min', el.style.getPropertyValue('--x-min'));
            this.radarElement.style.setProperty('--y-min', el.style.getPropertyValue('--y-min'));
            this.radarElement.classList.remove('hidden');
          }
      } else {
        m.classList.remove('active');
      }
    });

    if (!markerFound && this.radarElement) {
      this.radarElement.classList.add('hidden');
    }
  }

  private lastRawYaw: number | null = null;
  private totalRotation: number = 0;

  public updateRotation(yaw: number) {
    if (this.radarElement) {
      // Initialize if needed
      if (this.lastRawYaw === null) {
        this.lastRawYaw = yaw;
        this.totalRotation = yaw;
      }

      // Calculate shortest change
      let diff = yaw - this.lastRawYaw;
      if (diff > Math.PI) {
        diff -= 2 * Math.PI;
      } else if (diff < -Math.PI) {
        diff += 2 * Math.PI;
      }

      this.totalRotation += diff;
      this.lastRawYaw = yaw;

      // Apply offset (also in radians)
      const visibleRotation = this.totalRotation + this.currentRotationOffset;
      const deg = visibleRotation * (180 / Math.PI);
      this.radarElement.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
    }
  }

  public clearMap() {
    this.mapContent.innerHTML = '';
    this.container.classList.add('hidden');
  }

  public hide() {
    this.container.classList.add('hidden');
  }
}
