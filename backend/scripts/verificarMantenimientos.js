require('dotenv').config();
const db = require('../config/db.js');
const notificacionController = require('../controller/notificaciones.controller');
const { enviarCorreo } = require('../services/emailService.js');


const verificarMantenimientos = async () => {
    try {
        console.log("⏳ Verificando mantenimientos pendientes...");

        // Obtener mantenimientos pendientes mas el correo del usuario
        const [mantenimientos] = await db.promise().query(`
        SELECT am.id, am.usuario_id, am.fecha_asignacion, u.nombre AS nombre_usuario, u.email
        FROM asignacionmantenimiento am
        JOIN usuario u ON am.usuario_id = u.id
        WHERE am.estado = 'Pendiente'
        `);


        const hoy = new Date();
        const diasDeAnticipacion = 2; // Valor ajustable dependiendo la regla de negocio
        const MS_EN_DIA = 1000 * 60 * 60 * 24;

        for (const m of mantenimientos) {
            const fechaAsignacion = new Date(m.fecha_asignacion);
            const diferenciaEnDias = Math.ceil((fechaAsignacion - hoy) / MS_EN_DIA);

            if (diferenciaEnDias <= diasDeAnticipacion) {
                const esHoy = diferenciaEnDias === 0;
                const mensaje = esHoy
                    ? `Tenés un mantenimiento pendiente para HOY.`
                    : `Tenés un mantenimiento asignado que vence en ${diferenciaEnDias} día(s).`;

                await notificacionController.crear({
                    usuario_id: m.usuario_id,
                    titulo: 'Recordatorio de mantenimiento',
                    mensaje,
                    tipo: 'mantenimiento',
                    referencia_id: m.id,
                    referencia_tipo: 'mantenimiento'
                });
                await enviarCorreo({
                    para: m.email,
                    asunto: 'Recordatorio de mantenimiento',
                    mensaje: `Hola ${m.nombre_usuario},\n\n${mensaje}\n\nPor favor ingresá al sistema para más detalles.\n\nLogiRefrigeración`
                });
                console.log(`✅ Notificación enviada a ${m.nombre_usuario} (ID ${m.usuario_id})`);
            }
        }

        console.log("✅ Verificación finalizada.");
        process.exit(0); // Finalizar proceso correctamente
    } catch (err) {
        console.error("❌ Error al verificar mantenimientos:", err.message);
        process.exit(1); // Finalizar proceso con error
    }
};

verificarMantenimientos();
