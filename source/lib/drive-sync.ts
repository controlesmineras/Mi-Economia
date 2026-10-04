import {backupSchema,mergeRecords,readRecords,writeRecords,type Movement} from './local-records';
export const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const PREFIX='mi-economia-v1-';
type DriveFile={id:string;name:string};
export class DriveAuthorizationError extends Error {}
async function driveFetch(token:string,url:string,init:RequestInit={}){const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+token);const response=await fetch(url,{...init,headers});if(response.status===401||response.status===403)throw new DriveAuthorizationError('Vuelve a conectar Drive para continuar sincronizando.');if(!response.ok)throw Error('No pudimos sincronizar con Drive. Tus registros siguen guardados en este dispositivo.');return response;}
export async function synchronizeDrive(token:string,storage:Storage):Promise<Movement[]>{
 let device=storage.getItem('mi-economia.device.v1');if(!device){device=crypto.randomUUID();storage.setItem('mi-economia.device.v1',device);}
 if(!/^[a-f0-9-]{36}$/.test(device))throw Error('No pudimos identificar este dispositivo.');
 const files:DriveFile[]=[];let page='';let pages=0;
 do {if(++pages>100)throw Error('Hay demasiados respaldos para sincronizar.');const query=new URLSearchParams({spaces:'appDataFolder',q:"trashed = false and name contains 'mi-economia-v1-'",fields:'nextPageToken,files(id,name)',pageSize:'100'});if(page)query.set('pageToken',page);const response=await driveFetch(token,'https://www.googleapis.com/drive/v3/files?'+query);const data=await response.json() as {files:DriveFile[];nextPageToken?:string};if(!Array.isArray(data.files))throw Error('Drive devolvió una respuesta incompleta.');files.push(...data.files.filter(f=>f.name.startsWith(PREFIX)&&f.name.endsWith('.json')));page=data.nextPageToken||'';}while(page);
 let remote:Movement[]=[];
 for(const file of files){const response=await driveFetch(token,'https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(file.id)+'?alt=media');const raw=await response.text();if(raw.length>20*1024*1024)throw Error('Un respaldo de Drive es demasiado grande.');const backup=backupSchema.safeParse(JSON.parse(raw));if(!backup.success)throw Error('Hay un respaldo incompatible en Drive. No cambiamos tus registros.');remote=mergeRecords(remote,backup.data.movements);}
 // Re-read after network calls so records saved while downloading are preserved.
 const merged=mergeRecords(readRecords(storage),remote);writeRecords(storage,merged);
 const name=PREFIX+device+'.json';const existing=files.find(f=>f.name===name);const backup=JSON.stringify({app:'mi-economia',version:1,exportedAt:new Date().toISOString(),movements:merged});
 if(existing){await driveFetch(token,'https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(existing.id)+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body:backup});}
 else {const boundary='economia-'+crypto.randomUUID();const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify({name,parents:['appDataFolder'],mimeType:'application/json'})+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+backup+'\r\n--'+boundary+'--';await driveFetch(token,'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});}
 return merged;
}
