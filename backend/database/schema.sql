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

-- Volcando estructura para tabla logirefrigeracion.asignacionmantenimiento
CREATE TABLE IF NOT EXISTS `asignacionmantenimiento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `freezer_id` int(11) NOT NULL,
  `fecha_creacion` date NOT NULL,
  `fecha_asignacion` datetime NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT '',
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_usuario_asignacionmantenimiento` (`usuario_id`),
  KEY `FK_freezer_asignacionmantenimiento` (`freezer_id`),
  CONSTRAINT `FK_freezer_asignacionmantenimiento` FOREIGN KEY (`freezer_id`) REFERENCES `freezer` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_usuario_asignacionmantenimiento` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla lleva los registros de las asignaciones a mantenimientos de freezers para cada operador (usuario)';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.auditoriadeactividades
CREATE TABLE IF NOT EXISTS `auditoriadeactividades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `usuario_nombre` varchar(255) NOT NULL DEFAULT '',
  `fecha_hora` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `accion` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FK_usuario_auditoria` (`usuario_id`),
  CONSTRAINT `FK_usuario_auditoria` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla registra las acciones más importantes en el sistema.';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cuit` varchar(50) NOT NULL DEFAULT '0',
  `nombre_negocio` varchar(50) NOT NULL DEFAULT '',
  `nombre_responsable` varchar(50) NOT NULL DEFAULT '',
  `fecha_registro` date NOT NULL,
  `telefono` varchar(100) NOT NULL DEFAULT '',
  `correo` varchar(100) NOT NULL DEFAULT '',
  `direccion` varchar(100) NOT NULL DEFAULT '',
  `tipo_negocio` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cuit` (`cuit`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla contiene los registros de la información en profundidad de cada cliente que la empresa registre.';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.codigos_registro
CREATE TABLE IF NOT EXISTS `codigos_registro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(100) NOT NULL,
  `rol` enum('administrador','operador') NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_expiracion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.departamento
CREATE TABLE IF NOT EXISTS `departamento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla contiene los departamentos correspondientes a la provincia de Mendoza.';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.eventofreezer
CREATE TABLE IF NOT EXISTS `eventofreezer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT 0,
  `freezer_id` int(11) NOT NULL DEFAULT 0,
  `usuario_nombre` varchar(50) NOT NULL DEFAULT '0',
  `cliente_id` int(11) DEFAULT 0,
  `cliente_nombre` varchar(50) NOT NULL DEFAULT '0',
  `fecha` datetime NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT '',
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_usuario_evento` (`usuario_id`),
  KEY `FK_cliente_evento` (`cliente_id`),
  KEY `FK_freezer_evento` (`freezer_id`),
  CONSTRAINT `FK_cliente_evento` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_freezer_evento` FOREIGN KEY (`freezer_id`) REFERENCES `freezer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_usuario_evento` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla contiene los registros de los diferentes tipos de eventos en donde 1 freezer pueda verse afectado, por ejemplo: retiro o entrega.';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.freezer
CREATE TABLE IF NOT EXISTS `freezer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) DEFAULT 0,
  `numero_serie` varchar(100) NOT NULL DEFAULT '',
  `modelo` varchar(100) NOT NULL DEFAULT '',
  `tipo` varchar(50) NOT NULL DEFAULT '',
  `fecha_creacion` date NOT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `capacidad` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT '',
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_serie` (`numero_serie`),
  KEY `FK_cliente_freezer` (`cliente_id`),
  CONSTRAINT `FK_cliente_freezer` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla registra cada electrodoméstico que tiene la empresa con todos sus detalles.';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.mantenimiento
CREATE TABLE IF NOT EXISTS `mantenimiento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `freezer_id` int(11) NOT NULL,
  `usuario_nombre` varchar(100) NOT NULL DEFAULT '',
  `fecha` datetime NOT NULL,
  `descripcion` text NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT '',
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_usuario_mantenimiento` (`usuario_id`),
  KEY `FK_freezer_mantenimiento` (`freezer_id`),
  CONSTRAINT `FK_freezer_mantenimiento` FOREIGN KEY (`freezer_id`) REFERENCES `freezer` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_usuario_mantenimiento` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla tiene los registros de los mantenimientos realizados a cada Freezer o Heladera.';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.notificacion
CREATE TABLE IF NOT EXISTS `notificacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL DEFAULT 0,
  `titulo` varchar(100) NOT NULL DEFAULT '0',
  `mensaje` text NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT '0',
  `referencia_id` int(11) DEFAULT 0,
  `referencia_tipo` varchar(50) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `leida` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_usuario_notificacion` (`usuario_id`),
  CONSTRAINT `FK_usuario_notificacion` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla sirve para almacenar los mensajes de notificacion que pueda recibir cada usuario junto con sus datos';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `activo` tinyint(4) NOT NULL DEFAULT 0,
  `requiere_cambio_password` tinyint(4) DEFAULT 0,
  `token_recuperacion` varchar(255) DEFAULT NULL,
  `expiracion_token` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Tabla que contiene la información del usuario';

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla logirefrigeracion.zona
CREATE TABLE IF NOT EXISTS `zona` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `departamento_id` int(11) NOT NULL DEFAULT 0,
  `usuario_id` int(11) DEFAULT 0,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_zona_departamento` (`departamento_id`),
  KEY `FK_zona_usuario` (`usuario_id`),
  CONSTRAINT `FK_zona_departamento` FOREIGN KEY (`departamento_id`) REFERENCES `departamento` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_zona_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Esta tabla guarda las diferentes zonas de la ciudad de Mendoza que pertenecen a sus correspondientes departamentos.';

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
