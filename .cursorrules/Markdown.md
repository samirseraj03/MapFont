# Reglas de Arquitectura del Proyecto (MapFont)

1. TECNOLOGÍA PRINCIPAL: Utilizamos Angular con **Standalone Components** (nada de NgModules) e Ionic Framework. 
2. BASE DE DATOS: Usamos Supabase con el SDK `@supabase/supabase-js`. NO uses AngularFire ni RxJS para las peticiones de Supabase a menos que sea estrictamente necesario.
3. SEGURIDAD (RLS): Todas las inserciones a las tablas `users` y `usertype` DEBEN incluir explícitamente el `autencationUserID` obtenido tras el registro.
4. ROLES: Al crear un usuario nuevo en `usertype`, siempre se debe mandar `admin_role: false`.
5. UX: Todas las promesas asíncronas deben tener `try/catch/finally` y gestionar correctamente los `LoadingController` de Ionic.