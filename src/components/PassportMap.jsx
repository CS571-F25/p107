import React, { useEffect, useState, useMemo, useContext } from 'react';
import 'leaflet/dist/leaflet.css';
import './PassportMap.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getPost, generateExcerpt } from '../services/blogService';
import { Card, Button } from 'react-bootstrap';
import ThemeContext from './contexts/ThemeContext.jsx';

// Small helper to create a consistent DivIcon for markers
const createDivIcon = (status, size = 24) => {
  const className = `passport-marker ${status}`;
  return L.divIcon({
    className,
    html: `<span style="width:${size}px;height:${size}px;display:inline-block;border-radius:50%"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export default function PassportMap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // selected point
  const [selectedPost, setSelectedPost] = useState(null);

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
        console.warn('Could not load post preview:', err);
        setSelectedPost(null);
      }
    }
  };

  // Default view: center on first point or world view
  const center = useMemo(() => {
    if (points.length > 0 && points[0].coords && points[0].coords.length === 2) {
      return [points[0].coords[0], points[0].coords[1]];
    }
    return [20, 0];
  }, [points]);

  // Tile layer selection for dark/light
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Accessibility: provide icon creators
  const completedIcon = createDivIcon('completed');
  const plannedIcon = createDivIcon('planned');

  return (
    <div className="passport-map-root d-flex flex-column flex-lg-row gap-3">
      <div className="map-area flex-fill" style={{ minHeight: 360 }}>
        <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={tileUrl} />

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

      <aside className="map-sidebar" aria-live="polite">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Passport Map</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Travel & posts</Card.Subtitle>

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
                      <Button variant="primary" size="sm" href={`/blog/${selectedPost.slug || selectedPost.id}`}>
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
                  <div className="text-muted">No preview available</div>
                )}
              </div>
            )}

            <hr />
            <div>
              <strong>{points.length}</strong> locations
            </div>
          </Card.Body>
        </Card>
      </aside>
    </div>
  );
}
