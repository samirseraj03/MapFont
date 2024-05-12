import json
import csv
from datetime import datetime

# Lee los datos JSON
with open('./Scripts/08019_fonts.geojson', 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)

# Abre un nuevo archivo CSV de salida
with open('datos_transformados_nuevo.csv', 'w', encoding='utf-8', newline='') as csv_file:
    writer = csv.writer(csv_file)

    # Escribe la fila de encabezado
    writer.writerow(['location', 'name', 'address', 'ispotable', 'available', 'created_at', 'photo', 'description', 'watersourcetype'])

    # Procesa cada característica en los datos JSON
    for feature in data['features']:
        # Extrae los datos necesarios
        nom = feature['properties']['INVENTARI_NOM'] + ' ' + feature['properties']['INVENTARI_CODI']
        tipus = feature['properties']['INVENTARI_TIPUS']
        carrer = feature['properties']['INVENTARI_CARRER']
        numero_carrer = feature['properties']['INVENTARI_NUMERO_CARRER']
        latitude = feature['geometry']['coordinates'][1]
        longitude = feature['geometry']['coordinates'][0]

        # Crea la ubicación en formato JSON
        location = f'{{"latitude": {latitude}, "longitude": {longitude}}}'

        # Crea la dirección
        address = f'{carrer}, {numero_carrer}'

        # Formatea la fecha y hora
        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Escribe la fila con los datos procesados
        writer.writerow([location, nom, address, '', '', created_at, '', tipus, ''])

print("Transformación completada.")
