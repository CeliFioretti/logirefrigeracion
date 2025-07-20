import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import '../styles/FreezerForm.css';
import { UserContext } from '../context/UserContext'

const FreezerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useContext(UserContext);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        modelo: '',
        numero_serie: '',
        tipo: '',
        fecha_creacion: formatDate(new Date()),
        marca: '',
        capacidad: '',
        imagen: '',
        cliente_id: '',
        estado: 'Disponible'
    });

    // Para la validación
    const [formErrors, setFormErrors] = useState({});

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [clientes, setClientes] = useState([]);
    const tiposFreezer = ["Horizontal", "Horizontal No-Frost", "Vertical", "Vertical No-Frost"];
    const estadosManualesFreezer = ["Baja", "Mantenimiento"];

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'modelo':
                // Ejemplo: Modelo debe ser alfanumérico con guiones, entre 3 y 15 caracteres
                if (!value.trim()) {
                    error = 'El modelo es requerido.';
                } else if (!/^[a-zA-Z0-9-]{3,15}$/.test(value)) {
                    error = 'El modelo debe contener letras, números o guiones y tener entre 3 y 15 caracteres. Ej: FZ-300';
                }
                break;
            case 'numero_serie':
                // Ejemplo: Número de serie debe ser alfanumérico con guiones/espacios, entre 5 y 20 caracteres
                if (!value.trim()) {
                    error = 'El número de serie es requerido.';
                } else if (!/^[a-zA-Z0-9- ]{5,20}$/.test(value)) {
                    error = 'El número de serie debe contener letras, números, guiones o espacios y tener entre 5 y 20 caracteres. Ej: HZ-LG-2025-001';
                }
                break;
            case 'tipo':
                if (!value) {
                    error = 'El tipo es requerido.';
                }
                break;
            case 'fecha_creacion':
                if (!value) {
                    error = 'La fecha de adquisición es requerida.';
                } else {
                    // Validar que la fecha no sea en el futuro
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate > today) {
                        error = 'La fecha de adquisición no puede ser futura.';
                    }
                }
                break;
            case 'marca':
                if (!value.trim()) {
                    error = 'La marca es requerida.';
                } else if (value.trim().length < 2 || value.trim().length > 20) {
                    error = 'La marca debe tener entre 2 y 20 caracteres.';
                }
                break;
            case 'capacidad':
                // Capacidad debe ser un número positivo
                const numValue = Number(value);
                if (isNaN(numValue) || value === '') {
                    error = 'La capacidad es requerida y debe ser un número.';
                } else if (numValue <= 0) {
                    error = 'La capacidad debe ser un número positivo.';
                }
                break;
            default:
                break;
        }
        return error;
    };

    // Función de validación de todo el formulario
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        // Validar todos los campos requeridos y con patrones específicos
        const fieldsToValidate = ['modelo', 'numero_serie', 'tipo', 'fecha_creacion', 'marca', 'capacidad'];
        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        setFormErrors(errors);
        return isValid;
    };

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            const fetchFreezer = async () => {
                try {
                    const response = await axiosInstance.get(`/freezers/${id}`);
                    const freezerData = response.data.data;
                    setFormData({
                        modelo: freezerData.modelo || '',
                        numero_serie: freezerData.numero_serie || '',
                        tipo: freezerData.tipo || '',
                        fecha_creacion: freezerData.fecha_creacion ? new Date(freezerData.fecha_creacion).toISOString().split('T')[0] : '',
                        marca: freezerData.marca || '',
                        capacidad: freezerData.capacidad || '',
                        imagen: freezerData.imagen || '',
                        cliente_id: freezerData.cliente_id ? String(freezerData.cliente_id) : '',
                        estado: freezerData.estado || ''
                    });
                    setLoading(false);
                } catch (err) {
                    console.error("Error al cargar los datos del freezer:", err.response ? err.response.data : err.message);
                    setError("Error al cargar los datos del freezer. Verifique si el ID es correcto o si tiene permisos.");
                    setLoading(false);
                }
            };
            fetchFreezer();
        } else {
            setIsEditing(false);
            setLoading(false);

            // Establecemos un estado inicial para un nuevo freezer
            setFormData(prevData => ({
                ...prevData,
                estado: 'Disponible', // Estado inicial para los freezers nuevos
                fecha_creacion: formatDate(new Date()) // Fecha actual por defecto
            }))
        }
    }, [id, usuario?.token]);

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
    }, [usuario?.token]);

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

        // Limpiar el error del campo específico cuando el usuario empieza a escribir
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
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
            const isValid = validateForm();
            if (!isValid) {
                setLoading(false);
                setError('Por favor, corrige los errores en el formulario.');
                return;
            }


            const dataToSend = {
                ...formData,
                capacidad: formData.capacidad ? Number(formData.capacidad) : null,
                cliente_id: formData.cliente_id === '' ? null : Number(formData.cliente_id),
                estado: formData.estado
            };

            if (isEditing) {
                if (dataToSend.cliente_id !== null && (dataToSend.estado === "Baja" || dataToSend.estado === "Mantenimiento")) {
                    setLoading(false);
                    return setError('Para cambiar a "Baja" o "Mantenimiento", primero debe desasignar el cliente.');
                }
            }

            if (isEditing) {
                // PUT para actualizar
                await axiosInstance.put(`/freezers/${id}`, dataToSend);
                setSuccessMessage('Freezer actualizado correctamente.');

            } else {
                // POST para crear
                await axiosInstance.post('/freezers', dataToSend);
                setSuccessMessage('Freezer creado correctamente.');
                setFormData({
                    modelo: '',
                    numero_serie: '',
                    tipo: '',
                    fecha_creacion: new Date().toISOString().split('T')[0],
                    marca: '',
                    capacidad: '',
                    imagen: '',
                    cliente_id: '',
                    estado: 'Disponible'
                });
                setFormErrors({}) // Limpiar errores después del éxito
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
                        {formErrors.modelo && <p className="error-message">{formErrors.modelo}</p>}
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
                        {formErrors.numero_serie && <p className="error-message">{formErrors.numero_serie}</p>}
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
                        {formErrors.tipo && <p className="error-message">{formErrors.tipo}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="fecha_creacion">Fecha de adquisición</label>
                        <input
                            type="date"
                            id="fecha_creacion"
                            name="fecha_creacion"
                            value={formData.fecha_creacion}
                            onChange={handleChange}
                            required
                        />
                        {formErrors.fecha_creacion && <p className="error-message">{formErrors.fecha_creacion}</p>}
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
                        {formErrors.marca && <p className="error-message">{formErrors.marca}</p>}
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
                        {formErrors.capacidad && <p className="error-message">{formErrors.capacidad}</p>}
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

                        {!!formData.cliente_id && (
                            <p className="info-message">El estado se forzará a "Asignado" si se selecciona un cliente</p>
                        )}
                        {!formData.cliente_id && formData.estado === "Asignado" && isEditing && (
                            <p className="info-message error-message">No se puede asignar un freezer sin un cliente</p>
                        )}

                    </div>
                    <div className="form-group">
                        <label htmlFor="estado">Estado</label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            disabled={
                                // Deshabilitado si hay un cliente asignado y el estado no es Baja/Mantenimient
                                (!!formData.cliente_id && formData.estado !== 'Baja' && formData.estado !== 'Mantenimiento') ||
                                // Deshabilitado si estamos creando un freezer y el estado es Disponible o Asignado
                                (!isEditing && (formData.estado === "Disponible" || formData.estado === "Asignado")) ||
                                // Deshabilitado si es un freezer en edición y su estado es Disponible o Asignado,
                                (isEditing && (formData.estado === "Disponible" || formData.estado === "Asignado") && formData.cliente_id !== '')
                            }
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

                            {
                                !formData.cliente_id ? (
                                    estadosManualesFreezer.map(estado => (
                                        <option key={estado} value={estado}>{estado}</option>
                                    ))
                                ) : (
                                    (formData.estado === 'Baja' || formData.estado === 'Mantenimiento') &&
                                    <option key={formData.estado} value={formData.estado}>{formData.estado}</option>
                                )
                            }

                        </select>

                        {!!formData.cliente_id && (
                            <p className="info-message error-message">
                                Para cambiar a "Baja" o "Mantenimiento", primero debe desasignar el cliente.
                            </p>
                        )}

                        {!formData.cliente_id && formData.estado === "Disponible" && (
                            <p className="info-message">El estado es "Disponible" al no tener un cliente asignado.</p>
                        )}

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