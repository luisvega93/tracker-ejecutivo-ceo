# Tracker Ejecutivo CEO/COO

Aplicacion web minimalista para seguimiento ejecutivo. La portada publica esta pensada para el CEO y muestra solo tareas activas; el panel `/admin` permite al COO dar de alta, editar, completar y consultar el historico.

Tambien incluye un modo de publicacion estatica en GitHub Pages, similar al flujo de Cataliza, para que la vista del CEO quede disponible sin Vercel ni Supabase. En esa modalidad, la misma web permite cambiar entre vista CEO y vista COO, con edicion local guardada en el navegador y acceso protegido por una contrasena compartida.

## Stack

- Next.js 16 con App Router
- TypeScript
- Tailwind CSS v4
- Supabase para PostgreSQL + Auth
- Script de importacion desde Excel con `xlsx`
- Snapshot estatico versionado para GitHub Pages
- Pruebas unitarias con Vitest

## Estructura principal

```text
app/
  page.tsx
  admin/
    page.tsx
    login/
      page.tsx
components/
  admin/
  tracker-shell.tsx
  static-coo-workspace.tsx
  ui/
lib/
  auth.ts
  env.ts
  supabase/
  tracker/
scripts/
  import-tracker.ts
  sync-public-data.ts
supabase/sql/
  001_init.sql
data/
  tracker-public.json
tests/
  importer.test.ts
```

## Configuracion local

1. Instala dependencias:

```powershell
npm.cmd install
```

2. Crea tu archivo local de variables:

```powershell
Copy-Item .env.example .env.local
```

3. Completa `.env.local` con:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTHORIZED_ADMIN_EMAILS`
- `SEED_XLSX_PATH`

## Setup de Supabase

1. Crea un proyecto en Supabase.
2. En el SQL Editor, ejecuta el archivo `supabase/sql/001_init.sql`.
3. En `Authentication`, desactiva el registro publico si no quieres altas abiertas.
4. Crea manualmente el usuario del COO en `Authentication > Users`.
5. Registra el correo del COO tambien en `public.tracker_admins`, por ejemplo:

```sql
insert into public.tracker_admins (email)
values ('coo@empresa.com')
on conflict (email) do nothing;
```

6. Si quieres una segunda barrera a nivel app, tambien puedes incluir el correo del COO en `AUTHORIZED_ADMIN_EMAILS`.

## Importar el Excel

El repositorio ignora `TRACKER CEO.xlsx` para no publicar informacion sensible. Conserva el archivo localmente en la raiz o ajusta `SEED_XLSX_PATH`.

Ejecuta la importacion inicial:

```powershell
npm.cmd run import:excel -- --file ".\\TRACKER CEO.xlsx"
```

Que hace el importador:

- Lee la hoja `Tracker`
- Detecta automaticamente la fila de encabezados
- Limpia espacios extra
- Ignora filas vacias o con `ASUNTO` vacio
- Convierte errores tipo `#NAME?` en texto vacio
- Guarda `fecha_raw` tal como se ve en Excel
- Guarda `fecha_iso` solo cuando la fecha se puede resolver de forma segura
- Hace `upsert` por `source_row` para permitir reimportaciones sin duplicar

## Actualizar la version publica para GitHub Pages

La publicacion estatica no lee Supabase. Toma sus datos del archivo versionado `data/tracker-public.json`, que se genera desde tu Excel local.

Cada vez que cambies `TRACKER CEO.xlsx`, actualiza el snapshot:

```powershell
npm.cmd run sync:public-data -- --file ".\\TRACKER CEO.xlsx"
```

Ese comando:

- Lee la hoja `Tracker`
- Aplica la misma limpieza del importador
- Conserva tareas activas y completadas para soportar tambien la vista COO local
- Genera `data/tracker-public.json`

Despues haz commit y push para que GitHub Pages publique el cambio.

Nota de seguridad:

- `npm audit` reporta una vulnerabilidad conocida en `xlsx` sin fix disponible aguas arriba al momento de este build.
- Por eso, el importador debe usarse solo con archivos Excel locales y de confianza.
- Si en el futuro se requiere importar archivos de terceros o carga web, conviene migrar el parser a una alternativa sin esa alerta.

## Ejecutar localmente

Desarrollo:

```powershell
npm.cmd run dev
```

Calidad:

```powershell
npm.cmd run test:unit
npm.cmd run lint
npm.cmd run build
```

## Flujo de credenciales del admin

- No se incluyen credenciales en el repositorio.
- Crea el usuario del COO desde Supabase Auth.
- Agrega el correo del COO a `public.tracker_admins`.
- Si quieres reforzarlo tambien desde la app, define `AUTHORIZED_ADMIN_EMAILS`.
- El login del COO vive en `/admin/login`.

## Despliegue

### Vercel

1. Crea un nuevo proyecto en Vercel a partir de este repo.
2. Configura las mismas variables de entorno del `.env.local`.
3. Despliega.
4. Despues del primer deploy, vuelve a ejecutar la importacion apuntando al proyecto Supabase productivo si todavia no existe la data.

### GitHub Pages

1. El repo ya incluye `.github/workflows/github-pages.yml`.
2. Cada push a `main` construye una exportacion estatica de Next.js.
3. El workflow publica `out/` en GitHub Pages.
4. La URL final sigue este patron:

```text
https://TU_USUARIO.github.io/tracker-ejecutivo-ceo/
```

Notas:

- Esta version publica muestra la vista del CEO y una vista COO editable usando `data/tracker-public.json`
- La vista COO de GitHub Pages pide una contrasena compartida antes de habilitar la edicion
- La vista COO de GitHub Pages guarda cambios en `localStorage`, solo en el navegador actual
- El panel `/admin` queda deshabilitado en GitHub Pages porque requiere runtime y Supabase
- Si necesitas alta y edicion operativa del COO, usa el proyecto en local o en un hosting con runtime

## Publicar el repo en GitHub

Si todavia no existe repositorio Git en esta carpeta:

```powershell
git init
git add .
git commit -m "feat: tracker ejecutivo CEO/COO"
```

Si quieres conectarlo a un repositorio publico nuevo en GitHub:

```powershell
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO_PUBLICO.git
git push -u origin main
```

Si prefieres crearlo primero con GitHub CLI:

```powershell
gh repo create TU_REPO_PUBLICO --public --source . --remote origin --push
```

Para dejar GitHub Pages activo usando Actions:

```powershell
gh api -X POST repos/TU_USUARIO/TU_REPO_PUBLICO/pages -f build_type=workflow
```

## Nota importante para repositorio publico

- No subas `.env.local`
- No subas `TRACKER CEO.xlsx` salvo que lo sanitices
- El snapshot `data/tracker-public.json` si se versiona para que GitHub Pages pueda construir la vista publica
- No inventes llaves ni credenciales; este proyecto esta listo para publicarse cuando tengas tu propio proyecto Supabase y tu repo de GitHub
