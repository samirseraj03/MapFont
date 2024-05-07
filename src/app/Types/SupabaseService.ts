import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from './../../environments/environment';
import { AuthenticationService } from '../authentication.service';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';
import GeolocationService from '../Globals/Geolocation';

export interface User {
  id?: number;
  location: any;
  username: string;
  email: string;
  name: string;
  lastNname: string;
  number: number;
  address: string;
  photo: string;
  created_at: any;
  password: string;
  autencationUserID: string;
}

export interface WaterSources {
  id?: number;
  location: any;
  name: string;
  address: string;
  isPotable: boolean;
  available: boolean;
  created_at: any;
  photo: string;
  description: string;
  watersourcetype : string
}

export interface Forms {
  id?: number;
  username: string;
  watersourcesname: string;
  created_at: any;
  location: any;
  photo: string;
  address: string;
  description: string;
  is_potable: boolean;
  watersourcetype: string;
  approved: boolean | null;
  autencationUserID : string;
}

export interface UserType {
  id?: number;
  admin_role: boolean;
  user_role: boolean;
}

export default class DatabaseService {
  private supabase: SupabaseClient;
  private SUPABASE_URL = environment.SUPABASE_URL;
  private SUPABASE_KEY = environment.SUPABASE_KEY;
  private GeolocationService = new GeolocationService

  constructor() {
    const supabaseUrl = this.SUPABASE_URL;
    const supabaseKey = this.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar definidas en el archivo .env'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async insertUser(newUser: User): Promise<any> {
    try {
      // Insert location first
      // Insert the new user
      const { data: insertedUser, error: userError } = await this.supabase
        .from('users')
        .insert(newUser)
        .select();

      if (userError) {
        throw userError;
      }
      console.log('User inserted:', insertedUser);
      return insertedUser[0].id;
    } catch (error) {
      console.error('Error inserting user:', error);
    }
  }

  async updateUser(userId: any, updatedUser: User): Promise<any> {
    try {
      const { data: updatedUserData, error: updateError } = await this.supabase
        .from('users')
        .update(updatedUser)
        .eq('autencationUserID', userId)
        .select();

      if (updateError) {
        throw updateError;
      }

      console.log('User updated:', updatedUserData);
      return updatedUserData;
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async deleteUser(userId: number): Promise<any> {
    try {
      const { data: deletedUserData, error: deleteError } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .select();

      if (deleteError) {
        throw deleteError;
      }

      console.log('User deleted:', deletedUserData);
      return deletedUserData;
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  async insertWaterSource(newSource: WaterSources): Promise<any> {
    try {
      const { data: insertedSource, error: sourceError } = await this.supabase
        .from('watersources')
        .insert(newSource)
        .select();

      if (sourceError) {
        throw sourceError;
      }

      console.log('Water source inserted:', insertedSource);
      return insertedSource[0].id;
    } catch (error) {
      console.error('Error inserting water source:', error);
    }
  }

  async updateWaterSource(
    sourceId: number,
    updatedSource: WaterSources
  ): Promise<any> {
    try {
      const { data: updatedSourceData, error: updateError } =
        await this.supabase
          .from('watersources')
          .update(updatedSource)
          .eq('id', sourceId)
          .select();

      if (updateError) {
        throw updateError;
      }

      console.log('Water source updated:', updatedSourceData);
      return updatedSourceData;
    } catch (error) {
      console.error('Error updating water source:', error);
    }
  }

  async deleteWaterSource(sourceId: number): Promise<any> {
    try {
      const { data: deletedSourceData, error: deleteError } =
        await this.supabase
          .from('watersources')
          .delete()
          .eq('id', sourceId)
          .select();

      if (deleteError) {
        throw deleteError;
      }

      console.log('Water source deleted:', deletedSourceData);
      return deletedSourceData;
    } catch (error) {
      console.error('Error deleting water source:', error);
    }
  }

  async insertForm(newForm: Forms): Promise<any> {
    try {
      const { data: insertedForm, error: formError } = await this.supabase
        .from('forms')
        .insert(newForm)
        .select();

      if (formError) {
        throw formError;
      }

      console.log('Form inserted:', insertedForm);
      return insertedForm[0].id;
    } catch (error) {
      console.error('Error inserting form:', error);
    }
  }

  async updateForm(formId: number, updatedForm: Forms): Promise<any> {
    try {
      const { data: updatedFormData, error: updateError } = await this.supabase
        .from('forms')
        .update(updatedForm)
        .eq('id', formId)
        .select();

      if (updateError) {
        throw updateError;
      }

      console.log('Form updated:', updatedFormData);
      return updatedFormData;
    } catch (error) {
      console.error('Error updating form:', error);
    }
  }

  async deleteForm(formId: number): Promise<any> {
    try {
      const { data: deletedFormData, error: deleteError } = await this.supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .select();

      if (deleteError) {
        throw deleteError;
      }

      console.log('Form deleted:', deletedFormData);
      return deletedFormData;
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  }

  async insertUserType(newUserType: UserType): Promise<any> {
    try {
      const { data: insertedUserType, error: userTypeError } =
        await this.supabase.from('user_type').insert(newUserType).select();

      if (userTypeError) {
        throw userTypeError;
      }

      console.log('User type inserted:', insertedUserType);
      return insertedUserType[0].id;
    } catch (error) {
      console.error('Error inserting user type:', error);
    }
  }

  async updateUserType(
    userTypeId: number,
    updatedUserType: UserType
  ): Promise<any> {
    try {
      const { data: updatedUserTypeData, error: updateError } =
        await this.supabase
          .from('user_type')
          .update(updatedUserType)
          .eq('id', userTypeId)
          .select();

      if (updateError) {
        throw updateError;
      }

      console.log('User type updated:', updatedUserTypeData);
      return updatedUserTypeData;
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  }

  async deleteUserType(userTypeId: number): Promise<any> {
    try {
      const { data: deletedUserTypeData, error: deleteError } =
        await this.supabase
          .from('user_type')
          .delete()
          .eq('id', userTypeId)
          .select();

      if (deleteError) {
        throw deleteError;
      }

      console.log('User type deleted:', deletedUserTypeData);
      return deletedUserTypeData;
    } catch (error) {
      console.error('Error deleting user type:', error);
    }
  }

  async getUsers() {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*');

    if (error) {
      throw error;
    }

    console.log('Users retrieved:', users);
    return users; // Trust Supabase types
  }

  async getUser(user_id: any) {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('autencationUserID', user_id);

    if (error) {
      throw error;
    }
    return user; // Trust Supabase types
  }

  async getUserName (user_id : any){

    const { data: username, error } = await this.supabase
    .from('users')
    .select('username')
    .eq('autencationUserID', user_id);

  if (error) {
    throw error;
  }
  return username; // Trust Supabase types

  }

  async getWaterSources() {
    try {
      const { data: waterSources, error } = await this.supabase
        .from('watersources')
        .select('*');

      if (error) {
        throw error;
      }
      return waterSources;
    } catch (error) {
      console.error('Error retrieving water sources:', error);
      return error;
    }
  }

  async getForms() {
    try {
      const { data: forms, error } = await this.supabase
        .from('forms')
        .select('*');

      if (error) {
        throw error;
      }

      console.log('Forms retrieved:', forms);
      return forms;
    } catch (error) {
      console.error('Error retrieving forms:', error);
      return error;
    }
  }

  // funcion para comprabar si es string o no
  isStringArray(data: unknown): data is string[] {
    return (
      Array.isArray(data) && data.every((item) => typeof item === 'string')
    );
  }
  // para comprobar si es base64  o no
  IsBase64URL(url: string) {
    console.log('url', url);
    // Expresión regular para verificar el formato de base64 URL
    const regex = /^(data:)([a-zA-Z0-9+\/]+)(;base64,)(.*)$/;
    // Verificar si la cadena coincide con el formato de base64 URL
    return regex.test(url);
  }

  // para insertar a la stoarge
  async InsertToStoarge(file: any) {
    // comprovamos que es un file y que no sea string
    if (typeof file === 'object') {
      // comprobamos si el nombre esta bien escrito
      let nombre = this.esNombreArchivoValido(file.name);
      // subimos el archivo al storage
      const { data, error } = await this.supabase.storage
        .from('ImageWaterSource')
        .upload(nombre, file);
      if (error) {
        // si hay un duplicado de nombre , solictamos el la subida otr vez y ponemos un caracter para que pueda subir
        if (error.message == 'The resource already exists') {
          const { data, error } = await this.supabase.storage
            .from('ImageWaterSource')
            .upload(`_mapfont_${new Date().getDate()}_${new Date().getMilliseconds()}_${new Date().getTime()}${await this.GeolocationService.getUserID()}` + nombre, file);
          if (error) {
            return null;
          } else {
            if ('fullPath' in data) return data.fullPath;
            else return data.path;
          }
        } else {
          // retornamos que no ha sido possible subir el archivo
          return null;
        }
      } else {
        if ('fullPath' in data) return data.fullPath;
        else return data.path;
      }
      // si es string retoranmos como esta el file
    } else {
      return file;
    }
  }

  // para obtener de la storage
  GetStorage(url_image: any) {
    return `https://xcperzkujymdzvhfuqgi.supabase.co/storage/v1/object/public/${url_image}`;
  }

  // comporvamos que el nombre no tenga caracteres que impiden el funcionamiento
  esNombreArchivoValido(nombreArchivo: string) {
    // Caracteres problemáticos
    const caracteresProhibidos = [
      '/',
      '\\',
      '?',
      '%',
      '*',
      ':',
      '|',
      '"',
      '<',
      '>',
      '-',
      ' ',
    ];

    // Reemplazar caracteres problemáticos por guiones bajos
    let nombreArchivoCorregido = nombreArchivo;
    for (const caracter of caracteresProhibidos) {
      nombreArchivoCorregido = nombreArchivo.split(caracter).join('_');
    }

    // Verificar si el nombre de archivo contiene espacios al principio o al final
    if (nombreArchivoCorregido.trim() !== nombreArchivoCorregido) {
      return nombreArchivoCorregido;
    }
    return nombreArchivoCorregido;
  }

  // obtenemos los formularios del usuario
  async getFormsUser(user_id: any) {
    try {
      console.log(user_id);
      const { data: forms, error } = await this.supabase
        .from('forms')
        .select('*')
        .eq('autencationUserID', user_id);

      if (error) {
        throw error;
      }

      console.log('Forms retrieved:', forms);
      return forms;
    } catch (error) {
      console.error('Error retrieving forms:', error);
      return error;
    }
  }

  async getUserTypes() {
    try {
      const { data: userTypes, error } = await this.supabase
        .from('user_type')
        .select('*');

      if (error) {
        throw error;
      }

      console.log('User types retrieved:', userTypes);
      return userTypes;
    } catch (error) {
      console.error('Error retrieving user types:', error);
      return error;
    }
  }

  async deleteSavedFoutain(savedFountain_id : any){

   const { data: savedFountainsData, error: fountainsError } = await this.supabase
          .from('savedfountains')
          .delete()
          .eq('id', savedFountain_id);

          if (fountainsError){
            return null
          }else{
            return 'Success'
          }
  }


  async getSavedFoutains(user_id: any) {
    let fountains_id = [];
    let matchedFountains = [];
    try {
      // Consulta para obtener los datos de public.savedfountains
      const { data: savedFountainsData, error: fountainsError } =
        await this.supabase
          .from('savedfountains')
          .select('*')
          .eq('autencationUserID', user_id);

      if (fountainsError) {
        throw fountainsError;
      } else {
        for (const fountain of savedFountainsData) {
          // Extract the ID from the current fountain object
          fountains_id.push(fountain.waterSource_id);
        }
      }
      // Consulta para obtener los datos de public.watersources
      const { data: FountainsData, error: FountainsError } = await this.supabase
        .from('watersources')
        .select('*')
        .in('id', fountains_id);

      if (FountainsError) {
        throw FountainsError;
      } else {
        for (const fountain of savedFountainsData) {
          const matchedWaterSources = FountainsData.filter(
            (waterSource) => waterSource.id === fountain.waterSource_id
          );
        
          // Agregar todas las coincidencias al array matchedFountains
          for (const matchedWaterSource of matchedWaterSources) {
            matchedFountains.push({
              savedFountain: fountain,
              matchedWaterSource: matchedWaterSource,
            });
          }
        }

        // Resultado
        console.log(
          'Fuentes guardadas que coinciden con los datos de watersources:',
          matchedFountains
        );
        return matchedFountains;
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return error;
    }
  }
}
