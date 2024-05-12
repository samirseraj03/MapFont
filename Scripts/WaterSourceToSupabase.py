import pandas as pd
from datetime import datetime
import requests

access_token = "pk.eyJ1Ijoic2FtaXJzZXJhaiIsImEiOiJjbHQxbW12YzAxNDZzMmpwMjZ1ampwY2d5In0.9mdf_NFaObRYnB1yQSYwWA"


def get_address_from_coordinates(latitude, longitude, access_token):
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{longitude},{latitude}.json?access_token={access_token}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data.get('features'):
            return data['features'][0]['place_name']
    return None


# Lee el archivo Excel
df = pd.read_excel('./Scripts/Modified_Coordinates.xlsx' )

print (df)
if (not df.empty):
    # Crea una nueva columna 'location' en formato JSON
    df['location'] = df.apply(lambda row: {'latitude': row['Latitude'], 'longitude': row['Longitude']}, axis=1)

    # Concatena 'NOM' y 'CODIBDH' para la columna 'name'
    df['name'] = df['NOM'] + ' ' + df['CODIBDH'].astype(str)

    # Crea columnas vacías para 'address', 'ispotable', 'available', 'photo'
    df['ispotable'] = ''
    df['available'] = ''
    df['photo'] = ''

    # Crea la columna 'created_at' con el formato especificado
    df['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Crea la columna 'description' combinando los atributos especificados
    df['description'] = df[['NOM', 'MUNICIPI', 'COMARCA', 'CONCA', 'MASSA', 'TIPUSUS']].apply(lambda x: f"{x['NOM']} del {x['MUNICIPI']} de la {x['COMARCA']}, es {x['CONCA']}, {x['MASSA']}", axis=1)


    df['address'] = df.apply(lambda row: get_address_from_coordinates(row['Latitude'], row['Longitude'], access_token), axis=1)


    # Establece 'watersourcetype' como 'publico'
    df['watersourcetype'] = 'publico'

    # Selecciona solo las columnas necesarias
    df = df[['location', 'name', 'address', 'ispotable', 'available', 'created_at', 'photo', 'description', 'watersourcetype']]

    # Guarda los datos en un archivo CSV
    df.to_csv('datos.csv', index=False)

else:
    print ("no se ha leido el archivo")