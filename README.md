# Sistema de Nutrición y Entrenamiento

Sistema integral para la gestión de nutrición y entrenamiento, desarrollado con React, TypeScript y Supabase.

## 🚀 Características

### Gestión de Usuarios
- Registro y autenticación de usuarios
- Roles diferenciados (Nutricionista, Entrenador, Cliente, Admin)
- Perfiles personalizados para cada tipo de usuario

### Nutrición
- Planes nutricionales personalizados
- Seguimiento de comidas y suplementos
- Registro de logros nutricionales
- Medidas corporales y seguimiento de progreso

### Entrenamiento
- Planes de entrenamiento personalizados
- Biblioteca de videos de ejercicios
- Seguimiento de rutinas y progreso

### Planificación
- Gestión de sesiones de nutrición
- Calendario de actividades
- Recordatorios y notificaciones

### Analíticas
- Reportes de progreso
- Estadísticas de seguimiento
- Métricas de rendimiento

## 🛠️ Tecnologías

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **Base de Datos**: PostgreSQL
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage

## 📦 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── dashboard/     # Componentes del dashboard
│   ├── measurements/  # Componentes de medidas corporales
│   ├── nutrition/     # Componentes de nutrición
│   ├── training/      # Componentes de entrenamiento
│   └── ui/           # Componentes de interfaz de usuario
├── context/          # Contextos de React
├── hooks/            # Hooks personalizados
├── lib/              # Utilidades y configuraciones
├── pages/            # Páginas de la aplicación
├── types/            # Definiciones de tipos TypeScript
└── utils/            # Funciones de utilidad
```

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales de Supabase.

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🔧 Configuración de Supabase

1. Crea un nuevo proyecto en Supabase
2. Configura las tablas necesarias:
   - users
   - profiles
   - clients
   - nutritionists
   - trainers
   - body_measurements
   - nutrition_plans
   - training_plans
   - meals
   - supplements
   - achievements

3. Configura las políticas de seguridad en Supabase

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte, envía un email a [EMAIL] o abre un issue en el repositorio.
#   n u t r i c i o n j o s u e o j e d a  
 