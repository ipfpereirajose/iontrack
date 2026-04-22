# Manual de Implementación - I.O.N.T.R.A.C.K.

**Infraestructura Operativa Normativa para la Trazabilidad, Registro y Análisis de Control Kinético.**

Este documento detalla la arquitectura, el proceso de despliegue y el manual de usuario para la plataforma SaaS de dosimetría.

---

## 1. Arquitectura del Ecosistema

I.O.N.T.R.A.C.K. es un sistema modular compuesto por:
- **Cloud Engine (Supabase)**: Base de datos relacional con Row Level Security (RLS).
- **Control Center (SuperAdmin)**: Gestión de laboratorios y facturación.
- **Operational Engine (Lab Manager)**: Gestión de clientes y validación de dosis.
- **Client Portal (B2B)**: Autoservicio para empresas y consulta de dosis.
- **Local Ingestion Agent**: Software ejecutable para captura de datos offline.

---

## 2. Despliegue en la Nube (Vercel)

Para desplegar la plataforma, se deben crear 3 proyectos en Vercel apuntando a los siguientes directorios de `apps/`:

### Variables de Envío Requeridas:
En cada proyecto, configurar:
- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu instancia de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Llave pública anon.

### Enlaces de Producción Actuales:
- **Landing Page**: [https://iontrack.vercel.app](https://iontrack.vercel.app)
- **SuperAdmin**: [https://superadmin-two-ecru.vercel.app](https://superadmin-two-ecru.vercel.app)
- **Lab Manager**: [https://lab-manager-six.vercel.app](https://lab-manager-six.vercel.app)
- **B2B Portal**: [https://b2b-portal-nine-lilac.vercel.app](https://b2b-portal-nine-lilac.vercel.app)

---

## 3. Guía del Agente Local (Para Laboratorios)

El Agente es la pieza clave para la **continuidad operativa sin internet**.

### Instalación:
1. Descargar `iontrack-agent.exe` desde el Dashboard del Lab Manager.
2. Crear una carpeta llamada `input/` en el mismo directorio del ejecutable.
3. Crear un archivo `.env` con las credenciales de Supabase (URL y Key).
4. Ejecutar el archivo.

### Uso:
- Cada vez que el hardware de dosimetría genere un reporte CSV, colóquelo en la carpeta `input/`.
- El Agente lo procesará instantáneamente, guardándolo en el buffer local y subiéndolo a la nube en cuanto detecte conexión.
- Acceda a `http://localhost:4000` para ver el monitor de estado local.

---

## 4. Flujo Operativo Normativo

1. **Ingesta**: El Agente lee los datos y los sube como "Pendientes".
2. **Validación**: El Oficial de Seguridad del Laboratorio revisa los datos en el Lab Manager.
3. **Alerta**: Si una dosis supera el 80% del límite (1.28 mSv), el sistema dispara una alerta automática.
4. **Publicación**: Una vez aprobada, la dosis es visible para el cliente final en su Portal B2B.
5. **Auditoría**: Cada cambio queda registrado en un log inmutable con hash de integridad para fines legales.

---

## 5. Mantenimiento y Soporte

- **Logs de Auditoría**: Consultables desde el módulo SuperAdmin para resolver disputas legales.
- **Estado del Sistema**: Monitoreo de latencia y salud de agentes desde el panel de Telemetría.
