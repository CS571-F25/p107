import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Row, 
  Col,
  Card, 
  Table, 
  Button, 
  Form, 
  Modal, 
  Alert, 
  Spinner, 
  Badge,
  Dropdown
} from 'react-bootstrap';
import ThemeContext from '../contexts/ThemeContext';
import { 
  getAllMapPoints, 
  createMapPoint, 
  updateMapPoint, 
  deleteMapPoint 
} from '../../services/passportService';

export default function PassportManagement() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    coords: [0, 0],
    status: 'planned',
    postId: ''
  });

  // Fetch points on mount
  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllMapPoints();
      setPoints(data.sort((a, b) => (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date())));
    } catch (err) {
      setError('Failed to load map points: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (point = null) => {
    if (point) {
      setEditingId(point.id);
      setFormData({
        title: point.title || '',
        coords: point.coords || [0, 0],
        status: point.status || 'planned',
        postId: point.postId || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        coords: [0, 0],
        status: 'planned',
        postId: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const newCoords = [...formData.coords];
      if (name === 'latitude') {
        newCoords[0] = parseFloat(value) || 0;
      } else {
        newCoords[1] = parseFloat(value) || 0;
      }
      setFormData({ ...formData, coords: newCoords });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSavePoint = async () => {
    try {
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (editingId) {
        await updateMapPoint(editingId, formData);
        setSuccess('Point updated successfully!');
      } else {
        await createMapPoint(formData);
        setSuccess('Point created successfully!');
      }

      handleCloseModal();
      await fetchPoints();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error saving point: ' + err.message);
      console.error(err);
    }
  };

  const handleDeleteClick = (point) => {
    setPointToDelete(point);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!pointToDelete) return;

    try {
      await deleteMapPoint(pointToDelete.id);
      setSuccess('Point deleted successfully!');
      setShowDeleteModal(false);
      setPointToDelete(null);
      await fetchPoints();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error deleting point: ' + err.message);
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading map points...</div>;
  }

  const cardStyle = {};

  return (
    <Container fluid style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Passport Management</h2>
              <p className="text-muted mb-0">Manage travel map points and locations</p>
            </div>
            <Button 
              variant="primary"
              onClick={() => handleShowModal()}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Point
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card style={cardStyle}>
            <Card.Body>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Status</th>
                    <th>Post ID</th>
                    <th style={{ width: '160px' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {points.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No map points yet. Create your first point to get started!
                      </td>
                    </tr>
                  ) : (
                    points.map(point => (
                      <tr key={point.id}>
                        <td>
                          <strong>{point.title}</strong>
                        </td>
                        <td className="font-monospace">{point.coords?.[0]?.toFixed(4) || '-'}</td>
                        <td className="font-monospace">{point.coords?.[1]?.toFixed(4) || '-'}</td>
                        <td>
                          <Badge 
                            bg={point.status === 'completed' ? 'success' : 'warning'}
                            className="text-capitalize"
                          >
                            {point.status}
                          </Badge>
                        </td>
                        <td>{point.postId ? <code className="text-muted">{point.postId.slice(0, 8)}...</code> : '-'}</td>
                        <td className="text-end">
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleShowModal(point)}
                                className="me-2"
                            >
                                <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(point)}
                            >
                                <i className="bi bi-trash"></i>
                            </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Edit Point' : 'Add New Point'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Taiwan Trip, Madison, West Lake"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Latitude *</Form.Label>
                  <Form.Control
                    type="number"
                    name="latitude"
                    value={formData.coords[0]}
                    onChange={handleFormChange}
                    step="0.0001"
                    placeholder="e.g., 25.0330"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Longitude *</Form.Label>
                  <Form.Control
                    type="number"
                    name="longitude"
                    value={formData.coords[1]}
                    onChange={handleFormChange}
                    step="0.0001"
                    placeholder="e.g., 121.5654"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Post ID (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="postId"
                value={formData.postId}
                onChange={handleFormChange}
                placeholder="Leave empty if no associated post"
              />
              <Form.Text className="text-muted">
                Connect to a blog post to show preview on map
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePoint}>
            {editingId ? 'Update Point' : 'Create Point'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Point</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to delete <strong>{pointToDelete?.title}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Point
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}