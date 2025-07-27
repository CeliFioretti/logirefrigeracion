const PDFDocument = require('pdfkit');
const db = require('../config/db'); 
const fs = require('fs');
const path = require('path'); 

const exportClientesToPdf = async (req, res, next) => {
    try {
        const { nombreCliente, tipoNegocio, nombreNegocio, cuit } = req.query;

        let query = 'SELECT * FROM cliente';
        let condiciones = [];
        let params = [];

        if (nombreCliente) {
            condiciones.push('nombre_responsable LIKE ?');
            params.push(`%${nombreCliente}%`);
        }
        if (tipoNegocio) {
            condiciones.push('tipo_negocio LIKE ?');
            params.push(`%${tipoNegocio}%`);
        }
        if (nombreNegocio) {
            condiciones.push('nombre_negocio LIKE ?');
            params.push(`%${nombreNegocio}%`);
        }
        if (cuit) {
            condiciones.push("REPLACE(cuit, '-', '') LIKE ?");
            params.push(`%${cuit}%`);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
        }

        const [clientes] = await db.promise().query(query, params);

        if (clientes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron clientes para exportar con los filtros aplicados.' });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="clientes.pdf"', 
                'Content-Length': pdfData.length
            }).end(pdfData);
        });

         const logoWidth = 120; 
        const logoHeight = 70;

        const logoPath = path.join(__dirname, '../assets/logo-negro-2.png')

        // Calcula la posición X para centrar el logo
        const centerX = (doc.page.width - logoWidth) / 2;
        const initialY = doc.y; 

        try {
            
            
           if (!fs.existsSync(logoPath)) {
                console.error('Error: Logo file not found at:', logoPath);
                doc.fontSize(10).text(' [Logo no disponible - Archivo no encontrado] ', { align: 'center' }); 
                doc.moveDown(0.2);
            } else {
                doc.image(logoPath, centerX, initialY, {
                    fit: [logoWidth, logoHeight],
                    align: 'center',           
                    valign: 'top'
                });
                doc.moveDown( (logoHeight / doc.currentLineHeight()) ); 
            }



        } catch (logoErr) {
            console.warn('No se pudo cargar el logo:', logoErr.message);
            doc.fontSize(10).text(' [Logo no disponible] ', { align: 'left', continued: true });
        }
        

        // Título principal del documento
        doc.fontSize(25).text('Listado de Clientes', { align: 'center' });
        
        // Nombre de la empresa
        doc.fontSize(10).text('LogiRefrigeración', { align: 'center' });
        doc.moveDown(2); 

        clientes.forEach((cliente, index) => {
            doc.font('Helvetica-Bold')
               .fontSize(12)
               .text(`Cliente #${index + 1}`);

            doc.font('Helvetica') 
               .fontSize(10)
               .text(`CUIT: ${cliente.cuit || 'N/A'}`);
            doc.text(`Nombre del Negocio: ${cliente.nombre_negocio || 'N/A'}`);
            doc.text(`Tipo de Negocio: ${cliente.tipo_negocio || 'N/A'}`);
            doc.text(`Nombre Responsable: ${cliente.nombre_responsable || 'N/A'}`);
            doc.text(`Teléfono: ${cliente.telefono || 'N/A'}`);
            doc.text(`Correo: ${cliente.correo || 'N/A'}`);
            doc.text(`Dirección: ${cliente.direccion || 'N/A'}`);
            doc.moveDown(1); 
        }); 

        doc.end();

    } catch (error) {
        console.error('Error al generar el PDF de clientes:', error);
        res.status(500).json({ message: 'Error al generar el PDF.', error: error.message });
    }
};

module.exports = {
    exportClientesToPdf
};