export const environment = {
  production: true,
  accessToken: 'pk.eyJ1Ijoic2FtaXJzZXJhaiIsImEiOiJjbHQxbW12YzAxNDZzMmpwMjZ1ampwY2d5In0.9mdf_NFaObRYnB1yQSYwWA', // Optional, can also be set per map (accessToken input of mgl-map)

  SUPABASE_URL: 'https://xcperzkujymdzvhfuqgi.supabase.co',
  SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcGVyemt1anltZHp2aGZ1cWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA1MjEyNzMsImV4cCI6MjAyNjA5NzI3M30.ex2sMtJwYjE44ZqlZURnqFyOjpK5rXsgmHeNBs7sSG4'


};


export const setMapboxAccessToken = (accessToken: string) => {
  (window as any).mapboxgl.accessToken = accessToken;
};