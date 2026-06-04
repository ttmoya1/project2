CREATE DATABASE IF NOT EXISTS bolsa_empleo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bolsa_empleo;

CREATE TABLE usuario (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         correo VARCHAR(100) UNIQUE NOT NULL,
                         clave VARCHAR(255) NOT NULL,
                         rol ENUM('ADMINISTRADOR', 'EMPRESA', 'OFERENTE') NOT NULL,
                         activo BOOLEAN DEFAULT FALSE,
                         fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empresa (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         usuario_id INT NOT NULL UNIQUE,
                         nombre VARCHAR(150) NOT NULL,
                         localizacion VARCHAR(200),
                         telefono VARCHAR(20),
                         descripcion TEXT,
                         aprobada BOOLEAN DEFAULT FALSE,
                         FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE oferente (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          usuario_id INT NOT NULL UNIQUE,
                          identificacion VARCHAR(20) UNIQUE NOT NULL,
                          nombre VARCHAR(100) NOT NULL,
                          primer_apellido VARCHAR(100) NOT NULL,
                          nacionalidad VARCHAR(100),
                          telefono VARCHAR(20),
                          lugar_residencia VARCHAR(200),
                          curriculum_pdf VARCHAR(300),
                          aprobado BOOLEAN DEFAULT FALSE,
                          FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE caracteristica (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                nombre VARCHAR(150) NOT NULL,
                                padre_id INT DEFAULT NULL,
                                FOREIGN KEY (padre_id) REFERENCES caracteristica(id)
);

CREATE TABLE puesto (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        empresa_id INT NOT NULL,
                        descripcion TEXT NOT NULL,
                        salario DECIMAL(10,2),
                        tipo ENUM('PUBLICO', 'PRIVADO') NOT NULL DEFAULT 'PUBLICO',
                        activo BOOLEAN DEFAULT TRUE,
                        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (empresa_id) REFERENCES empresa(id)
);

CREATE TABLE puesto_caracteristica (
                                       id INT AUTO_INCREMENT PRIMARY KEY,
                                       puesto_id INT NOT NULL,
                                       caracteristica_id INT NOT NULL,
                                       nivel_requerido INT NOT NULL COMMENT '1=Básico, 2=Intermedio, 3=Avanzado, 4=Experto, 5=Master',
                                       FOREIGN KEY (puesto_id) REFERENCES puesto(id),
                                       FOREIGN KEY (caracteristica_id) REFERENCES caracteristica(id)
);

CREATE TABLE oferente_caracteristica (
                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                         oferente_id INT NOT NULL,
                                         caracteristica_id INT NOT NULL,
                                         nivel INT NOT NULL COMMENT '1=Básico, 2=Intermedio, 3=Avanzado, 4=Experto, 5=Master',
                                         FOREIGN KEY (oferente_id) REFERENCES oferente(id),
                                         FOREIGN KEY (caracteristica_id) REFERENCES caracteristica(id)
);

-- Administrador por defecto
-- La clave es "admin123" encriptada con BCrypt
INSERT INTO usuario (correo, clave, rol, activo) VALUES
    ('admin@bolsa.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMINISTRADOR', TRUE);

-- Características jerárquicas de ejemplo
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Lenguajes de Programación', NULL);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Tecnologías Web', NULL);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Bases de Datos', NULL);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Testing', NULL);

-- Hijos de Lenguajes
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Java', 1);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Python', 1);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('C#', 1);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Kotlin', 1);

-- Hijos de Tecnologías Web
INSERT INTO caracteristica (nombre, padre_id) VALUES ('HTML', 2);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('CSS', 2);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('JavaScript', 2);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('React', 2);

-- Hijos de Bases de Datos
INSERT INTO caracteristica (nombre, padre_id) VALUES ('MySQL', 3);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('PostgreSQL', 3);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('MongoDB', 3);

-- Hijos de Testing
INSERT INTO caracteristica (nombre, padre_id) VALUES ('JUnit', 4);
INSERT INTO caracteristica (nombre, padre_id) VALUES ('Selenium', 4);

USE bolsa_empleo;
SHOW TABLES;
SELECT * FROM usuario;