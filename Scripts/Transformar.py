import csv
from datetime import datetime

# Lee el archivo CSV original y crea uno nuevo con los datos modificados
with open('datos.csv', 'r', encoding='utf-8') as file_in, \
     open('datos_transformados.csv', 'w', encoding='utf-8', newline='') as file_out:

    reader = csv.reader(file_in)
    writer = csv.writer(file_out)

    # Escribe la nueva fila de encabezado
    writer.writerow(['location', 'name', 'address', 'ispotable', 'available', 'created_at', 'photo', 'description', 'watersourcetype'])

    next(reader)  # Salta la fila de encabezado

    # Procesa cada fila del archivo original
    for row in reader:
        # Extrae latitud y longitud del campo 'location' si está presente
        location_data = row[0].strip('"') if row[0] else ''
        latitude = ''
        longitude = ''
        if location_data:
            location_parts = location_data.split(',')
            latitude = location_parts[0].split(':')[1].strip()
            longitude = location_parts[1].split(':')[1].strip().rstrip('}')

        # Modifica el campo 'name' para tener caracteres ASCII UTF-8
        name = row[1].encode('utf-8').decode('utf-8')

        # Modifica el campo 'description' para tener caracteres ASCII UTF-8
        description = row[7].encode('utf-8').decode('utf-8')

        # Escribe la fila con los datos modificados
        writer.writerow([f'{{"latitude": {latitude}, "longitude": {longitude}}}', name, row[2], row[3], row[4], row[5], row[6], description, row[8]])

print("Transformación completada.")
