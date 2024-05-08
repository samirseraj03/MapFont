import * as mapboxgl from "mapbox-gl";

export const environment = {
  production: true,
  accessToken: 'pk.eyJ1Ijoic2FtaXJzZXJhaiIsImEiOiJjbHQxbW12YzAxNDZzMmpwMjZ1ampwY2d5In0.9mdf_NFaObRYnB1yQSYwWA', // Optional, can also be set per map (accessToken input of mgl-map)

  SUPABASE_URL: 'https://xcperzkujymdzvhfuqgi.supabase.co',
  SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcGVyemt1anltZHp2aGZ1cWdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDUyMTI3MywiZXhwIjoyMDI2MDk3MjczfQ.2RdxCx7m604TuYVDoCkhfIk24WnUYNDPwovBXkHXyVA'


};


export const setMapboxAccessToken = (accessToken: string) => {
  (window as any).mapboxgl.accessToken = accessToken;
};