# Election Management Service

Microservicio especializado en la gestión de elecciones y candidatos dentro del ecosistema electoral SEVOTEC.

## Descripción

Este servicio maneja la creación, consulta y administración de elecciones electorales junto con sus candidatos asociados. Proporciona endpoints seguros para operaciones CRUD sobre datos electorales, utilizando cifrado JWE/JWS para la comunicación segura.

## Características

- ✅ **Gestión de Elecciones**: Crear y consultar elecciones con fecha específica
- ✅ **Administración de Candidatos**: Manejo de candidatos asociados a elecciones
- ✅ **Seguridad Avanzada**: Cifrado JWE/JWS con validación de API Key
- ✅ **Timezone Ecuador**: Manejo correcto de fechas en zona horaria de Ecuador
- ✅ **Versionado API**: Endpoints versionados para compatibilidad
- ✅ **Logging Profesional**: Sistema de logs estructurado con diferentes niveles

## Tecnologías

- **Framework**: NestJS
- **Base de Datos**: Supabase (PostgreSQL)
- **Seguridad**: JOSE (JWE/JWS), API Key Guard
- **Validación**: class-validator, class-transformer
- **Timezone**: America/Guayaquil

## API Endpoints

### Elecciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/election/today` | Obtiene la elección de hoy con candidatos |
| GET | `/api/v1/election/findAll` | Lista todas las elecciones |
| GET | `/api/v1/election/electionId` | Obtiene el ID de la elección de hoy |
| POST | `/api/v1/election/create` | Crea una nueva elección con candidatos |

## Configuración

### Variables de Entorno

```env
# Puerto del servicio
PORT=3004

# API Key para autenticación interna
API_KEY=your-secure-api-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cryptographic Keys (Base64)
ELECTION_MGMT_PRIVATE_KEY_BASE64=your-private-key-base64
ELECTION_PUBLIC_KEY_BASE64=gateway-public-key-base64
```

## Estructura del Proyecto

```
src/
├── config/           # Configuraciones de módulos
├── guards/          # Guards de seguridad (API Key)
├── interceptors/    # Interceptores (Envelope Opener)
├── modules/         # Módulos de negocio
│   ├── controllers/ # Controladores REST
│   ├── services/    # Lógica de negocio
│   ├── repository/  # Acceso a datos
│   ├── dto/         # Data Transfer Objects
│   └── entities/    # Entidades de base de datos
├── security/        # Servicios de seguridad (KeyVault)
└── supabase/        # Configuración de Supabase
```

## Seguridad

### Envelope de Seguridad
Todos los endpoints están protegidos mediante:
1. **API Key Guard**: Valida `x-api-key` en headers
2. **Envelope Opener**: Descifra `x-security-envelope` (JWE + JWS)

### Proceso de Descifrado
1. Se recibe JWE en header `x-security-envelope`
2. Se descifra usando clave privada del servicio
3. Se verifica firma JWS usando clave pública del gateway
4. Se inyectan datos descifrados en el request body

## Desarrollo

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## Logging

El servicio utiliza el logger nativo de NestJS con diferentes niveles:
- `log`: Información general de operaciones exitosas
- `error`: Errores con stack trace completo
- `warn`: Advertencias del sistema

## Base de Datos

### Tablas Principales

**elections**
- `id`: UUID único
- `name`: Nombre de la elección
- `election_date`: Fecha de la elección (YYYY-MM-DD)
- `created_at`: Timestamp de creación

**candidates**
- `id`: UUID único
- `name`: Nombre del candidato
- `political_group`: Agrupación política
- `election_id`: FK hacia elections

## Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3004
CMD ["node", "dist/main"]
```

## Estado del Servicio

- ✅ Documentación completa
- ✅ Logging profesional implementado
- ✅ Manejo de errores robusto
- ✅ Try-catch en capas críticas
- ✅ Eliminación de logs de debug
- ✅ Validación de entrada mejorada