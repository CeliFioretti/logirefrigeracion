import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';
import '../styles/AsignarFreezerForm.css';

const AsignarFreezerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const [freezer, setFreezer] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Obtener detalles del freezer
                const freezerResponse = await axiosInstance.get(`/freezers/${id}`);
                setFreezer(freezerResponse.data.data);

                // 2. Obtener la lista de clientes
                const clientesResponse = await axiosInstance.get('/clientes');
                setClientes(clientesResponse.data.data);

                setLoading(false);
            } catch (err) {
                console.error("Error al cargar datos:", err.response ? err.response.data : err.message);
                setError("Error al cargar los datos necesarios para asignar el freezer.");
                setLoading(false);
            }
        };

        if (usuario?.token) {
            fetchData();
        } else {

            setError("No autorizado. Por favor, inicie sesión.");
            setLoading(false);
        }
    }, [id, usuario?.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        if (!selectedClientId) {
            setError("Por favor, seleccione un cliente.");
            setIsSubmitting(false);
            return;
        }

        if (freezer.estado !== 'Disponible') {
            setError("El freezer no está disponible para asignación. Su estado actual es: " + freezer.estado);
            setIsSubmitting(false);
            return;
        }

        try {
            await axiosInstance.put(`/freezers/${id}/asignar`, { cliente_id: Number(selectedClientId) });
            setSuccessMessage("Freezer asignado correctamente.");

            setTimeout(() => {
                navigate(`/freezers/${id}`);
            }, 2000);
        } catch (err) {
            console.error("Error al asignar freezer:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || "Hubo un error al asignar el freezer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading-message">Cargando información del freezer y clientes...</div>;
    }

    if (error && !freezer) {
        return <div className="error-message">{error}</div>;
    }

    // Comprobación de estado para asignar
    const canAssign = freezer?.estado === 'Disponible';

    return (
        <div className="asignar-freezer-container">
            <h2>Asignar Freezer a Cliente</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {freezer ? (
                <div className="freezer-details-block"> 
                    {freezer.imagen && (
                        <div className="freezer-image-display">
                            <img src={freezer.imagen} alt="Imagen del Freezer" />
                        </div>
                    )}
                    <div className="freezer-info-text">
                        <h3>Detalles del Freezer:</h3>
                        <p><strong>ID:</strong> {freezer.id}</p>
                        <p><strong>Número de Serie:</strong> {freezer.numero_serie}</p>
                        <p><strong>Modelo:</strong> {freezer.modelo}</p>
                        <p><strong>Estado Actual:</strong> <span className={`status-${freezer.estado.toLowerCase().replace(' ', '-')}`}>{freezer.estado}</span></p>
                        {freezer.cliente_id && <p><strong>Asignado a Cliente ID:</strong> {freezer.cliente_id}</p>}
                    </div>
                </div>
            ) : (
                <p>No se encontraron detalles del freezer.</p>
            )}

            {!canAssign && freezer && (
                <div className="warning-message">
                    Este freezer no puede ser asignado porque su estado actual es "{freezer.estado}". Solo los freezers en estado "Disponible" pueden asignarse.
                </div>
            )}

            {canAssign && (
                <form onSubmit={handleSubmit} className="asignar-form">
                    <div className="form-group">
                        <label htmlFor="cliente_id">Seleccionar Cliente:</label>
                        <select
                            id="cliente_id"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            required
                        >
                            <option value="">-- Seleccione un cliente --</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre_negocio} ({cliente.nombre_responsable})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-confirm" disabled={isSubmitting || !canAssign}>
                            {isSubmitting ? 'Asignando...' : 'Asignar Freezer'}
                        </button>
                        <button type="button" className="btn btn-cancel" onClick={() => navigate(`/freezers/${id}`)}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AsignarFreezerForm;