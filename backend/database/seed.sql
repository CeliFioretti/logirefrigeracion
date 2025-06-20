-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.7.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando datos para la tabla logirefrigeracion.asignacionmantenimiento: ~0 rows (aproximadamente)

-- Volcando datos para la tabla logirefrigeracion.auditoriadeactividades: ~32 rows (aproximadamente)
INSERT INTO `auditoriadeactividades` (`id`, `usuario_id`, `usuario_nombre`, `fecha_hora`, `accion`) VALUES
	(1, 1, 'Juan Perez', '2025-05-15 20:13:23', 'Se creo un usuario nuevo'),
	(2, NULL, 'Celina Fioretti', '2025-05-21 22:08:23', 'Hizo algo nuevo'),
	(3, 1, 'Juan Pérez', '2025-05-21 23:53:30', 'Registro de nuevo departamento: Maipú'),
	(4, 1, 'Juan Pérez', '2025-05-22 11:23:35', 'Registro de nueva zona: Capilla de Nieves'),
	(6, 1, 'Juan Pérez', '2025-05-22 11:31:01', 'Registro de nueva zona: Bermejo'),
	(7, 1, 'Juan Pérez', '2025-05-24 14:10:50', 'Registro de nuevo cliente: Don Francisco Felix'),
	(8, 1, 'Juan Pérez', '2025-05-25 10:00:12', 'Edición de cliente ID 6'),
	(9, 1, 'Juan Pérez', '2025-05-25 10:04:59', 'Eliminación de cliente: Francisco Felix'),
	(10, 1, 'Juan Pérez', '2025-05-25 15:10:20', 'Se creo un nuevo freezer: Número de serie SN-WH20250525-001'),
	(13, 1, 'Juan Pérez', '2025-05-25 15:21:17', 'Edición de freezer ID 14'),
	(14, 1, 'Juan Pérez', '2025-05-25 15:22:53', 'Eliminación de freezer con nº: SN-WH20250525-001'),
	(15, 1, 'Juan Pérez', '2025-05-25 15:31:12', 'Asignación de freezer ID 10 al cliente ID 7'),
	(16, 1, 'Juan Pérez', '2025-05-25 16:41:06', 'Se creo un nuevo freezer: Número de serie SN-WH20250525-001'),
	(17, 1, 'Juan Pérez', '2025-05-25 16:41:33', 'Se creo un nuevo freezer: Número de serie SN-WH20250525-001'),
	(18, 1, 'Juan Pérez', '2025-05-25 16:42:36', 'Asignación de freezer ID 16 al cliente ID 7'),
	(19, 1, 'Juan Pérez', '2025-05-25 16:44:04', 'Se desasignó el freezer con ID 10'),
	(20, 1, 'Juan Pérez', '2025-05-28 21:39:24', 'Asignación de mantenimiento del freezer ID 16 al operador ID 17'),
	(21, 1, 'Juan Pérez', '2025-05-28 21:40:07', 'Eliminación de asignación de mantenimiento al operador ID 17, freezer ID 16'),
	(22, 1, 'Juan Pérez', '2025-05-28 21:40:14', 'Asignación de mantenimiento del freezer ID 16 al operador ID 17'),
	(23, 1, 'Juan Pérez', '2025-05-28 21:41:20', 'Asignación de mantenimiento del freezer ID 9 al operador ID 7'),
	(24, 1, 'Juan Pérez', '2025-05-28 21:45:35', 'Se creo un nuevo usuario: dani'),
	(25, NULL, 'dani', '2025-05-28 21:47:53', 'Operador dani confirmó mantenimiento del freezer ID 9'),
	(26, NULL, 'celiprueba', '2025-06-09 19:22:45', 'Se creó un nuevo freezer: Número de serie SN-WH20250630-002'),
	(27, NULL, 'celiprueba', '2025-06-09 19:42:07', 'Edición de freezer ID 17'),
	(28, 1, 'AdminJuan', '2025-06-14 09:32:49', 'Se creó un nuevo freezer: Número de serie Cliente-4freezer4'),
	(29, 1, 'AdminJuan', '2025-06-14 10:25:42', 'Registro de evento tipo ENTREGA para freezer ID 10'),
	(30, 1, 'AdminJuan', '2025-06-14 10:26:03', 'Registro de evento tipo RETIRO para freezer ID 10'),
	(31, 1, 'AdminJuan', '2025-06-14 10:30:05', 'Registro de evento tipo ENTREGA para freezer ID 17'),
	(32, 1, 'AdminJuan', '2025-06-14 10:55:48', 'Registro de nuevo cliente: Gina Flores'),
	(33, 1, 'AdminJuan', '2025-06-14 11:03:08', 'Registro de nuevo cliente: Gina Flores'),
	(34, 1, 'AdminJuan', '2025-06-15 11:03:11', 'Eliminación de cliente: Juan Pérez, Local: Distribuidora Mendoza'),
	(35, 1, 'AdminJuan', '2025-06-15 11:42:59', 'Registro de evento tipo ENTREGA para freezer ID 10');

-- Volcando datos para la tabla logirefrigeracion.cliente: ~6 rows (aproximadamente)
INSERT INTO `cliente` (`id`, `cuit`, `nombre_negocio`, `nombre_responsable`, `fecha_registro`, `telefono`, `correo`, `direccion`, `tipo_negocio`) VALUES
	(2, '30-50401884-5', 'Bodega Los Andes', 'María López', '2025-04-22', '+54 261 555-5678', 'maria.lopez@bodegalosandes.com', 'Ruta 40 Km 15, Maipú', 'Vitivinícola'),
	(3, '30-54668997-9', 'Refrigeración Express', 'Carlos Gómez', '2025-03-15', '+54 261 555-9876', 'carlos.gomez@refrigeracionexpress.com', 'Calle Mitre 456, Godoy Cruz', 'Servicios'),
	(4, '30-50053085-1', 'Supermercado El Sol', 'Sofía Herrera', '2025-02-28', '+54 261 555-6543', 'sofia.herrera@superelsol.com', 'Av. Las Heras 789, Guaymallén', 'Retail'),
	(5, '27392376352', 'ElectroMendoza', 'Martín Díaz', '2025-01-12', '+54 261 555-3210', 'martin.diaz@electromendoza.com', 'Boulevard Dorrego 321, Las Heras', 'Electrónica'),
	(7, '45986784523', 'Candeal panificados', 'Felix Arnaldo', '2025-05-28', '+54261555-7489', 'felixitocandeal@gmail.com', 'Pedro molina 489 Bermejo', 'Panadería'),
	(9, '27385687415', 'YES', 'Gina Flores', '2025-06-14', '26153984658', 'yesgina@email.com', 'San Martín 412, Ciudad, Mendoza', 'Drugstore');

-- Volcando datos para la tabla logirefrigeracion.codigos_registro: ~11 rows (aproximadamente)
INSERT INTO `codigos_registro` (`id`, `codigo`, `rol`, `usado`, `fecha_creacion`, `fecha_expiracion`) VALUES
	(1, 'ESu2I1FaeJ', 'operador', 1, '2025-06-09 11:37:02', '2025-06-09 15:30:00'),
	(2, 'RzL9XyBzw-', 'operador', 1, '2025-06-09 11:50:04', '2025-06-11 14:50:04'),
	(3, 'rqsKgB0NsW', 'operador', 1, '2025-06-09 15:30:41', '2025-06-11 18:30:41'),
	(4, 'wMo6tfArpq', 'operador', 1, '2025-06-09 18:01:03', '2025-06-11 21:01:03'),
	(5, 'UEnv3zvBqX', 'operador', 0, '2025-06-09 18:01:04', '2025-06-11 21:01:04'),
	(6, 'o4pj09FZJc', 'operador', 0, '2025-06-09 18:01:04', '2025-06-11 21:01:04'),
	(7, '91dQfIm8YE', 'operador', 0, '2025-06-09 18:01:05', '2025-06-11 21:01:05'),
	(8, '_5Wl9QTqsT', 'operador', 0, '2025-06-09 18:01:05', '2025-06-11 21:01:05'),
	(9, 'IH2knk5phA', 'operador', 0, '2025-06-09 18:01:05', '2025-06-11 21:01:05'),
	(10, 'GI072rD7_g', 'operador', 0, '2025-06-09 18:01:05', '2025-06-11 21:01:05'),
	(11, 'YbgEEB4Y1t', 'operador', 0, '2025-06-09 18:01:05', '2025-06-11 21:01:05');

-- Volcando datos para la tabla logirefrigeracion.departamento: ~6 rows (aproximadamente)
INSERT INTO `departamento` (`id`, `nombre`) VALUES
	(1, 'Ciudad de Mendoza'),
	(2, 'Godoy Cruz'),
	(3, 'Guaymallén'),
	(4, 'Las Heras'),
	(6, 'Luján'),
	(13, 'Maipú');

-- Volcando datos para la tabla logirefrigeracion.eventofreezer: ~4 rows (aproximadamente)
INSERT INTO `eventofreezer` (`id`, `usuario_id`, `freezer_id`, `usuario_nombre`, `cliente_id`, `cliente_nombre`, `fecha`, `tipo`, `observaciones`) VALUES
	(2, 1, 10, 'AdminJuan', 7, 'Felix Arnaldo', '2025-06-14 10:25:42', 'entrega', NULL),
	(3, 1, 10, 'AdminJuan', 7, 'Felix Arnaldo', '2025-06-14 10:26:03', 'retiro', NULL),
	(4, 1, 17, 'AdminJuan', 7, 'Felix Arnaldo', '2025-06-14 10:30:05', 'entrega', NULL),
	(5, 1, 10, 'AdminJuan', 3, 'Carlos Gómez', '2025-06-15 11:42:59', 'entrega', 'ninguna');

-- Volcando datos para la tabla logirefrigeracion.freezer: ~7 rows (aproximadamente)
INSERT INTO `freezer` (`id`, `cliente_id`, `numero_serie`, `modelo`, `tipo`, `fecha_creacion`, `marca`, `capacidad`, `estado`, `imagen`) VALUES
	(2, 3, 'SN-WH20250506-001', 'FZ-300', 'Vertical No Frost', '2025-05-06', 'Whirlpool', 300, 'Prestado', NULL),
	(3, 2, 'SN-WH20250404-002', 'FZ-400', 'Horizontal', '2025-04-04', 'Whirpool', 400, 'Prestado', NULL),
	(9, NULL, 'SN-WH20250708-004', 'FZ-600', 'Vertical No Frost', '2025-07-08', 'Whirlpool', 600, 'Baja', NULL),
	(10, NULL, 'SN-WH20250809-005', 'FZ-700', 'Horizontal', '2025-08-09', 'Whirlpool', 700, 'Asignado', NULL),
	(11, NULL, 'SN-WH20250910-006', 'FZ-800', 'Vertical No Frost', '2025-09-10', 'Whirlpool', 800, 'Disponible', NULL),
	(16, 7, 'SN-WH20250525-001', 'FZ-500', 'Horizontal No Frost', '2023-05-22', 'Whirlpool', 500, 'Asignado', 'https://m.media-amazon.com/images/I/61Awc6TTvVL._AC_SL1500_.jpg'),
	(17, NULL, 'SN-WH20250630-002', 'FZ-400', 'Horizontal No Frost', '2025-06-09', 'Heladerin', 400, 'Asignado', NULL);

-- Volcando datos para la tabla logirefrigeracion.mantenimiento: ~2 rows (aproximadamente)
INSERT INTO `mantenimiento` (`id`, `usuario_id`, `freezer_id`, `usuario_nombre`, `fecha`, `descripcion`, `tipo`, `observaciones`) VALUES
	(1, 15, 3, 'Carlos Sanchez', '2025-05-17 00:00:00', 'Reparación de motor', 'Reparación', 'El Freezer sigue sin funcionar'),
	(4, 24, 9, 'Daniel Juar', '2025-05-28 00:00:00', 'Mantenimiento realizado', 'Correctivo', 'Intentar encender el freezer');

-- Volcando datos para la tabla logirefrigeracion.notificacion: ~0 rows (aproximadamente)

-- Volcando datos para la tabla logirefrigeracion.usuario: ~7 rows (aproximadamente)
INSERT INTO `usuario` (`id`, `nombre`, `correo`, `password`, `rol`, `activo`, `requiere_cambio_password`, `token_recuperacion`, `expiracion_token`) VALUES
	(1, 'AdminJuan', 'juan.perez@email.com', '$2b$10$r7YdXhnVT3Y21Z/0X7Hg1uveGwwkK1r8mvwiDx3RdH2lNf6hDK4n6', 'administrador', 1, 0, NULL, NULL),
	(7, 'Pepe Pepito', 'pepepetito2232@gmail.com', '$2b$10$Um.gD514vk7CrzX6F/3aj.6/4v7mrcmEu0K8kDnXwA.ojgdru57fe', 'operador', 1, 0, NULL, NULL),
	(15, 'Carlos Sanchez', 'carlitosSanchi@email.com', '$2b$10$HJRw2k7Q3/Zv0NJNS.MEb.Lh5wCPMmIX6xnryEUL7z3LRrb9Ir0b2', 'operador', 1, 0, NULL, NULL),
	(21, 'admin', 'admin1234@correo.com.ar', '$2b$10$49KEhrctL91G35kH9wbv5uJG/rBtcL./X4D6CD9Lip71t1y/GoYXG', 'administrador', 1, 0, NULL, NULL),
	(22, 'pepeito2321', 'pepeodw@correo.com.ar', '$2b$10$TjSp6hElFArqUp2qvwaeIePxBxtiOPw5L9eTaOnGCybgP0EeOMDHa', 'operador', 1, 0, NULL, NULL),
	(23, 'usuario_inactivo', 'usuarioinactivo@gmail.com', '$2b$10$CY4TmQEdNhDeq8pS5GOfnODOVGbqrgWhowh0oXJDePV/G0.1IY13K', 'operador', 0, 0, NULL, NULL),
	(24, 'operador1', 'op1@mail.com', '$2b$10$VKTxEWC66JJorMUS/Ow1J.7kh7rQ21tUlVFcfPN276Y2td.Eslqde', 'operador', 1, 0, NULL, NULL);

-- Volcando datos para la tabla logirefrigeracion.zona: ~12 rows (aproximadamente)
INSERT INTO `zona` (`id`, `departamento_id`, `usuario_id`, `nombre`) VALUES
	(25, 1, 15, 'Quinta Sección'),
	(26, 1, 15, 'Sexta Sección'),
	(27, 2, NULL, 'Bombal Sur'),
	(28, 2, NULL, 'San Francisco del Monte'),
	(29, 3, 15, 'San josé'),
	(30, 3, 7, 'Villanueva'),
	(31, 4, 15, 'El Challao'),
	(32, 4, 15, 'Panquehua'),
	(33, 6, 7, 'Chacras de Coria'),
	(34, 6, 15, 'Carrodilla'),
	(36, 3, 1, 'Capilla de Nieves'),
	(38, 3, 1, 'Bermejo');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
