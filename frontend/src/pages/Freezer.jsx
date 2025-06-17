import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box
} from '@mui/material';
import axios from '../api/axios'; 

function Freezers() {
  const [freezers, setFreezers] = useState([]);

  useEffect(() => {
    const fetchFreezers = async () => {
      try {
        const { data } = await axios.get('/freezers');
        setFreezers(data);
      } catch (error) {
        console.error('Error al obtener los freezers:', error);

        if (error.response?.status === 401) {
          alert('Sesión expirada. Por favor, iniciá sesión de nuevo.');
          window.location.href = '/login';
        } else {
          alert('Ocurrió un error al cargar los datos de los freezers.');
        }
      }
    };

    fetchFreezers();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Freezers
      </Typography>

      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha de Compra</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Número de Serie</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Cliente</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {freezers.map((freezer) => (
              <TableRow key={freezer.id}>
                <TableCell>{freezer.id}</TableCell>
                <TableCell>{freezer.fechaCompra}</TableCell>
                <TableCell>{freezer.modelo}</TableCell>
                <TableCell>{freezer.nroSerie}</TableCell>
                <TableCell>{freezer.tipo}</TableCell>
                <TableCell>{freezer.capacidad}</TableCell>
                <TableCell>{freezer.estado}</TableCell>
                <TableCell>{freezer.zona}</TableCell>
                <TableCell>{freezer.cliente}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default Freezers;
