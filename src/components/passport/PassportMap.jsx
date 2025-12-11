import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router';
import 'leaflet/dist/leaflet.css';
import './PassportMap.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { getPost, generateExcerpt } from '../../services/blogService.js';
import { Card, Button } from 'react-bootstrap';
import ThemeContext from '../contexts/ThemeContext.jsx';

// Small helper to create a consistent DivIcon for markers
const createDivIcon = (status, size = 32) => {
  const isCompleted = status === 'completed';
  const className = `passport-marker ${status}`;
  
  return L.divIcon({
    className,
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${isCompleted ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 4px ${isCompleted ? 'rgba(102, 126, 234, 0.2)' : 'rgba(245, 87, 108, 0.2)'};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        cursor: pointer;
      ">
        <i class="bi bi-${isCompleted ? 'geo-alt-fill' : 'geo-alt'}" style="color: white; font-size: ${size * 0.5}px;"></i>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

function MapBoundsHandler({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(pt => 
        pt.coords && 
        pt.coords.length === 2 && 
        typeof pt.coords[0] === 'number' && 
        typeof pt.coords[1] === 'number'
      );

      if (validPoints.length === 0) return;

      if (validPoints.length === 1) {
        // 如果只有一个点，居中并设置合适的缩放级别
        map.setView([validPoints[0].coords[0], validPoints[0].coords[1]], 10);
      } else {
        // 如果有多个点，计算边界并自动适配
        const bounds = L.latLngBounds(validPoints.map(pt => [pt.coords[0], pt.coords[1]]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [points, map]);

  return null;
}

function MapViewController({ targetPoint }) {
  const map = useMap();

  useEffect(() => {
    if (targetPoint && targetPoint.coords && targetPoint.coords.length === 2) {
      map.setView([targetPoint.coords[0], targetPoint.coords[1]], 12, {
        animate: true,
        duration: 1
      });
    }
  }, [targetPoint, map]);

  return null;
}

export default function PassportMap() {
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // selected point
  const [selectedPost, setSelectedPost] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);
  const listRefs = React.useRef({});

  // Theme support - use ThemeContext (dark/light)
  const { theme } = useContext(ThemeContext) || { theme: 'light' };
  const isDark = theme === 'dark';

  useEffect(() => {
    let mounted = true;
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const q = collection(db, 'mapPoints');
        const snapshot = await getDocs(q);
        const items = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          items.push({ id: doc.id, ...data });
        });
        if (mounted) setPoints(items);
      } catch (err) {
        console.error('Error loading map points:', err);
        if (mounted) setError('Failed to load map points');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPoints();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selected && listRefs.current[selected.id]) {
      listRefs.current[selected.id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selected]);

  const handleMarkerClick = async (point) => {
    setSelected(point);
    setSelectedPost(null);
    if (point.postId) {
      try {
        const post = await getPost(point.postId);
        // create a preview if needed
        const preview = post.content ? generateExcerpt(post.content, 220) : post.excerpt || '';
        setSelectedPost({ ...post, preview });
      } catch (err) {
        // Silently handle permission errors - guest users can't access posts
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          console.log('Post preview not available for guests');
        } else {
          console.warn('Could not load post preview:', err);
        }
        setSelectedPost(null);
      }
    }
  };

  const handleLocationClick = (point) => {
    setMapTarget(point);
    setSelected(point);
    handleMarkerClick(point);
  };

  // Default view: center on first point or world view
  const center = useMemo(() => {
    if (points.length > 0) {
      const validPoints = points.filter(pt => 
        pt.coords && 
        pt.coords.length === 2 && 
        typeof pt.coords[0] === 'number' && 
        typeof pt.coords[1] === 'number'
      );
      
      if (validPoints.length > 0) {
        // 计算所有点的中心
        const avgLat = validPoints.reduce((sum, pt) => sum + pt.coords[0], 0) / validPoints.length;
        const avgLng = validPoints.reduce((sum, pt) => sum + pt.coords[1], 0) / validPoints.length;
        return [avgLat, avgLng];
      }
    }
    return [20, 0]; // 默认世界视图
  }, [points]);

  // Tile layer selection for dark/light
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Accessibility: provide icon creators
  const completedIcon = createDivIcon('completed');
  const plannedIcon = createDivIcon('planned');

  return (
    <div className="passport-map-root d-flex flex-column flex-lg-row gap-3" role="main">
      <div className="map-area flex-fill" role="region" aria-label="Interactive travel map">
        <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }} role="application" aria-label="Leaflet map showing travel locations">
          <TileLayer url={tileUrl} />
          <MapBoundsHandler points={points} />
          <MapViewController targetPoint={mapTarget} />

          {points.map(pt => {
            const lat = pt.coords?.[0];
            const lng = pt.coords?.[1];
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;
            const status = (pt.status === 'completed') ? 'completed' : 'planned';
            const icon = status === 'completed' ? completedIcon : plannedIcon;

            return (
              <Marker
                key={pt.id}
                position={[lat, lng]}
                icon={icon}
                eventHandlers={{ click: () => handleMarkerClick(pt) }}
              />
            );
          })}
        </MapContainer>
      </div>

      <aside className="map-sidebar" aria-label="Passport map locations sidebar">
        <Card className="h-100">
          <Card.Body>
            <h2 className="card-title">Passport Map</h2>
            <p className="text-muted mb-3">Travel & posts</p>

            {loading && <div className="text-muted">Loading map points…</div>}
            {error && <div className="text-danger">{error}</div>}

            {!selected && !loading && (
              <div className="text-muted">Click a marker to view the post preview.</div>
            )}

            {selected && (
              <div>
                <h6 className="mt-2">{selected.title}</h6>
                <div className="small text-muted mb-2">Status: {selected.status}</div>

                {selectedPost ? (
                  <>
                    <div className="mb-3">{selectedPost.preview}</div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => navigate(`/blog/${selectedPost.slug || selectedPost.id}`)}
                      >
                        View Post
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => {
                        setSelected(null);
                        setSelectedPost(null);
                      }}>
                        Close
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="text-muted mb-2">
                      {selected.postId ? 'Post preview not available. Please sign in to view.' : 'No associated post.'}
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={() => {
                      setSelected(null);
                      setSelectedPost(null);
                    }}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}

            <hr />
            <h3 className="h6 mb-3" id="locations-heading">
              <strong>{points.length}</strong> location{points.length !== 1 ? 's' : ''}
            </h3>

            {points.length > 0 && (
              <nav aria-labelledby="locations-heading">
                <ul className="list-unstyled mb-0" style={{ fontSize: '0.9rem' }} role="list">
                  {[...points]
                    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
                    .map(point => (
                      <li 
                        key={point.id}
                        ref={(el) => { if (el) listRefs.current[point.id] = el; }}
                        className="mb-1"
                        role="listitem"
                        aria-current={selected?.id === point.id ? 'location' : undefined}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          backgroundColor: selected?.id === point.id ? (isDark ? '#374151' : '#e9ecef') : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLocationClick(point);
                          }}
                          aria-label={`${point.title} - Status: ${point.status}`}
                          className="text-decoration-none d-flex align-items-center gap-2"
                          style={{
                            color: selected?.id === point.id ? (isDark ? '#60a5fa' : '#0d6efd') : 'inherit',
                            fontWeight: selected?.id === point.id ? 'bold' : 'normal'
                          }}
                        >
                          <i 
                            className={`bi bi-${point.status === 'completed' ? 'check-circle-fill' : 'circle'}`}
                            aria-hidden="true"
                            style={{ 
                              fontSize: '0.75rem',
                              color: point.status === 'completed' ? '#22c55e' : '#fbbf24'
                            }}
                          ></i>
                          <span>{point.title}</span>
                        </a>
                      </li>
                    ))
                  }
                </ul>
              </nav>
            )}
          </Card.Body>
        </Card>
      </aside>
    </div>
  );
}
