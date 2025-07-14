import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import '../styles/FreezerForm.css';

const FreezerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        modelo: '',
        numero_serie: '',
        tipo: '',
        fecha_adquisicion: '',
        marca: '',
        capacidad: '',
        imagen: '',
        cliente_id: '',
        estado: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [clientes, setClientes] = useState([]);
    const tiposFreezer = ["Horizontal", "Horizontal No-Frost", "Vertical", "Vertical No-Frost"];
    const estadosManualesFreezer = ["Baja", "Mantenimiento"];

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            const fetchFreezer = async () => {
                try {
                    const response = await axiosInstance.get(`/freezer/${id}`);
                    const freezerData = response.data.data;
                    setFormData({
                        modelo: freezerData.modelo || '',
                        numero_serie: freezerData.numero_serie || '',
                        tipo: freezerData.tipo || '',
                        fecha_adquisicion: freezerData.fecha_creacion ? new Date(freezerData.fecha_creacion).toISOString().split('T')[0] : '',
                        marca: freezerData.marca || '',
                        capacidad: freezerData.capacidad || '',
                        imagen: freezerData.imagen || '',
                        cliente_id: freezerData.cliente_id ? String(freezerData.cliente_id) : '',
                        estado: freezerData.estado || ''
                    });
                    setLoading(false);
                } catch (err) {
                    console.error("Error al cargar los datos del freezer:", err);
                    setError("Error al cargar los datos del freezer.");
                    setLoading(false);
                }
            };
            fetchFreezer();
        } else {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await axiosInstance.get('/clientes');
                setClientes(response.data.data);
            } catch (err) {
                console.error("Error al cargar los clientes:", err);
                setError("Error al cargar la lista de clientes.");
            }
        };
        fetchClientes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => {
            const newData = {
                ...prevData,
                [name]: value
            };

            if (name === "cliente_id") {
                if (value !== "") {
                    newData.estado = "Asignado";
                } else {
                    newData.estado = "Disponible";
                }
            }
            return newData;
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prevData => ({
                    ...prevData,
                    imagen: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const dataToSend = {
                ...formData,
                capacidad: formData.capacidad ? Number(formData.capacidad) : null,
                cliente_id: formData.cliente_id ? Number(formData.cliente_id) : null,
                estado: formData.estado
            };

            if (formData.fecha_adquisicion) {
                dataToSend.fecha_creacion = formData.fecha_adquisicion;
            }
            delete dataToSend.fecha_adquisicion;

            if (isEditing) {
                await axiosInstance.put(`/freezers/${id}`, dataToSend);
                setSuccessMessage('Freezer actualizado correctamente.');
            } else {
                await axiosInstance.post('/freezers', dataToSend);
                setSuccessMessage('Freezer creado correctamente.');
                setFormData({
                    modelo: '',
                    numero_serie: '',
                    tipo: '',
                    fecha_adquisicion: '',
                    marca: '',
                    capacidad: '',
                    imagen: '',
                    cliente_id: '',
                    estado: ''
                });
            }

        } catch (err) {
            console.error("Error al enviar el formulario:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.error || 'Error al guardar el freezer. Verifique los datos o el tamaño de la imagen.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return <div className="loading-message">Cargando datos del freezer...</div>;
    }

    return (
        <div className="freezer-form-container">
            <h2>{isEditing ? 'EDITAR FREEZER' : 'REGISTRAR FREEZER'}</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <form onSubmit={handleSubmit} className="freezer-form">
                <div className="form-left">
                    <div className="form-group">
                        <label htmlFor="modelo">Modelo</label>
                        <input
                            type="text"
                            id="modelo"
                            name="modelo"
                            value={formData.modelo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="numero_serie">Número de serie</label>
                        <input
                            type="text"
                            id="numero_serie"
                            name="numero_serie"
                            value={formData.numero_serie}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tipo">Tipo</label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un tipo</option>
                            {tiposFreezer.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="fecha_adquisicion">Fecha de adquisición</label>
                        <input
                            type="date"
                            id="fecha_adquisicion"
                            name="fecha_adquisicion"
                            value={formData.fecha_adquisicion}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="marca">Marca</label>
                        <input
                            type="text"
                            id="marca"
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="capacidad">Capacidad</label>
                        <input
                            type="number"
                            id="capacidad"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cliente_id">Cliente Asignado</label>
                        <select
                            id="cliente_id"
                            name="cliente_id"
                            value={formData.cliente_id}
                            onChange={handleChange}
                        >
                            <option value="">Ninguno</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>{cliente.nombre_negocio} ({cliente.nombre_responsable})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="estado">Estado</label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            disabled={!!formData.cliente_id}
                        >
                            <option value="">Seleccione un estado</option>
                            {estadosManualesFreezer.map(estado => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                            {formData.estado === "Disponible" && !formData.cliente_id && (
                                <option key="Disponible" value="Disponible">Disponible</option>
                            )}
                             {formData.estado === "Asignado" && !!formData.cliente_id && (
                                <option key="Asignado" value="Asignado">Asignado</option>
                            )}
                        </select>
                        {!!formData.cliente_id && <p className="info-message">El estado se forzará a "Asignado" si se selecciona un cliente.</p>}
                        {!formData.cliente_id && formData.estado === "Asignado" && <p className="info-message error-message">No se puede asignar un freezer sin un cliente.</p>}
                    </div>
                </div>
                <div className="form-right">
                    <div className="image-upload-section">
                        <div className="image-placeholder">
                            {formData.imagen ? (
                                <img src={formData.imagen} alt="Previsualización del Freezer" />
                            ) : (
                                <i className="fas fa-camera"></i>
                            )}
                        </div>
                        <input
                            type="file"
                            id="imagen"
                            name="imagen"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="imagen" className="custom-file-upload">
                            Escoge la imagen del Freezer
                        </label>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn btn-cancel" onClick={() => navigate('/freezers/listado')}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-confirm" disabled={loading}>
                        {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Confirmar Edición' : 'Confirmar')}
                    </button>
                </div>
            </form>
                {successMessage && <div id='success-message-final' className="success-message">{successMessage}</div>}
        </div>
    );
};

export default FreezerForm;